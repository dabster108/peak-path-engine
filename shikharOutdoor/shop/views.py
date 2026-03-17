# shikharOutdoor\shop\views.py
import json
import urllib.request
from urllib.error import HTTPError, URLError

from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests

from django.conf import settings

from .models import CustomUser, Product, Section, Badge, Category
from .serializers import (
    BadgeSerializer,
    CategorySerializer,
    ProductSerializer,
    RegisterSerializer,
    LoginSerializer,
    SectionSerializer,
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
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ["PATCH", "PUT"]:
            return ProfileSettingsSerializer
        return UserSerializer


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    queryset = CustomUser.objects.all().order_by("-date_joined")


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])

        return Response({"detail": "Password updated successfully."})
    
class AddProductView(generics.CreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]


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