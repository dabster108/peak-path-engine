# shikharOutdoor\shop\views.py
import json
import urllib.request
from urllib.error import HTTPError, URLError

from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests

from django.conf import settings

from .models import CustomUser, Product, ProductImage, Section, Badge, Category
from .serializers import (
    BadgeSerializer,
    CategorySerializer,
    ProductImageSerializer,
    ProductSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    LoginSerializer,
    SectionSerializer,
    UserListSerializer,
    UserSerializer,
    ProfileSettingsSerializer,
    ChangePasswordSerializer,
    GoogleAuthSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny] 


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data
        })


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]   # ← add this

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]

        user_info = None
        if token.count(".") == 2:
            try:
                user_info = id_token.verify_oauth2_token(
                    token, requests.Request(), settings.GOOGLE_CLIENT_ID,
                )
            except ValueError:
                user_info = None

        if user_info is None:
            try:
                req = urllib.request.Request(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {token}"},
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    user_info = json.load(resp)
            except (HTTPError, URLError):
                return Response({"error": "Invalid Google token"}, status=400)

        email = user_info.get("email")
        if not email:
            return Response({"error": "Google did not return an email"}, status=400)

        # ✅ Use email prefix as username — guaranteed unique per email
        base_username = email.split("@")[0]
        
        user, created = CustomUser.objects.get_or_create(email=email)
        if created:
            user.username = base_username
            user.first_name = user_info.get("given_name", "")
            user.last_name = user_info.get("family_name", "")
            user.set_unusable_password()   # Google users have no password
            user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        })


class ProfileView(generics.RetrieveUpdateAPIView):       
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ProfileUpdateSerializer
        return UserSerializer

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"detail": "Password updated successfully."})


class UserListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != "admin" and not self.request.user.is_staff:
            return CustomUser.objects.none()
        return CustomUser.objects.all().order_by("-date_joined")
    
    
class AddProductView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        data = {
            "name":     request.data.get("name"),
            "category": request.data.get("category"),
            "section":  request.data.get("section"),
            "badge":    request.data.get("badge") or None,
            "price":    request.data.get("price"),
            "stock":    request.data.get("stock"),
        }

        serializer = ProductSerializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        product = serializer.save()

        images = request.FILES.getlist("images")
        for i, image_file in enumerate(images):
            ProductImage.objects.create(
                product=product,
                image=image_file,
                is_primary=(i == 0),
                order=i,
            )
        result = ProductSerializer(product, context={"request": request})
        return Response(result.data, status=201)


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    queryset = Product.objects.all()


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    queryset = Product.objects.all()

class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    queryset = Category.objects.all()

class SectionListView(generics.ListAPIView):
    serializer_class = SectionSerializer
    permission_classes = [AllowAny]
    queryset = Section.objects.all()

class BadgeListView(generics.ListAPIView):
    serializer_class = BadgeSerializer
    permission_classes = [AllowAny]
    queryset = Badge.objects.all()


class ProductImageUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=404)

        images = request.FILES.getlist("images")
        if not images:
            return Response({"error": "No images provided."}, status=400)

        created = []
        for i, image_file in enumerate(images):
            # First uploaded image becomes primary if none exists
            is_primary = (i == 0 and not product.images.exists())
            img = ProductImage.objects.create(
                product=product,
                image=image_file,
                is_primary=is_primary,
                order=product.images.count(),
            )
            created.append(img)

        serializer = ProductImageSerializer(
            created, many=True, context={"request": request}
        )
        return Response(serializer.data, status=201)

    def delete(self, request, pk):
        image_id = request.data.get("image_id")
        try:
            image = ProductImage.objects.get(pk=image_id, product__pk=pk)
            image.image.delete(save=False)  # delete file from disk
            image.delete()
            return Response({"detail": "Image deleted."})
        except ProductImage.DoesNotExist:
            return Response({"error": "Image not found."}, status=404)