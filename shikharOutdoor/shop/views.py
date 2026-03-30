# shikharOutdoor\shop\views.py
from datetime import date, timedelta
import json , secrets, string, urllib.request
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

from .models import AboutReview, BlogPost, Cart, CartItem, CustomUser, Order, OrderItem, Product, ProductImage, Review, Section, Badge, Category, UserProfile
from .serializers import (
    AboutReviewSerializer,
    BadgeSerializer,
    BlogPostSerializer,
    CartSerializer,
    CategorySerializer,
    OrderSerializer,
    ProductImageSerializer,
    ProductSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    LoginSerializer,
    ReviewSerializer,
    SectionSerializer,
    UserListSerializer,
    UserProfileSerializer,
    UserSerializer,
    ProfileSettingsSerializer,
    ChangePasswordSerializer,
    GoogleAuthSerializer,
)


def generate_order_number():
    alphabet = string.ascii_uppercase + string.digits
    suffix = ''.join(secrets.choice(alphabet) for _ in range(8))
    return f"SKR-{suffix}"

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

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def _get_profile(self, user):
        profile, _ = UserProfile.objects.get_or_create(user=user)
        return profile

    def get(self, request):
        profile = self._get_profile(request.user)
        serializer = UserProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        profile = self._get_profile(request.user)
        serializer = UserProfileSerializer(
            profile, data=request.data,
            partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


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

class ReviewListCreateView(APIView):
    def get_permissions(self):
        return [AllowAny()] if self.request.method == 'GET' else [IsAuthenticated()]

    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)
        reviews = product.reviews.all()
        return Response(ReviewSerializer(reviews, many=True).data)

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)

        if Review.objects.filter(product=product, user=request.user).exists():
            return Response({'error': 'You have already reviewed this product.'}, status=400)

        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product, user=request.user)
        return Response(serializer.data, status=201)


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




# ── Cart ──────────────────────────────────────────────────

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    def delete(self, request):
        # Clear entire cart
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response({'detail': 'Cart cleared.'})


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Add or update item
        product_id = request.data.get('product_id')
        size       = request.data.get('size', 'Medium')
        quantity   = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, size=size,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity = min(10, item.quantity + quantity)
            item.save()

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data, status=201)

    def patch(self, request, item_id):
        # Update quantity of a specific item
        try:
            cart = Cart.objects.get(user=request.user)
            item = cart.items.get(pk=item_id)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({'error': 'Item not found.'}, status=404)

        quantity = int(request.data.get('quantity', item.quantity))
        item.quantity = max(1, min(10, quantity))
        item.save()

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, item_id=None):
        try:
            cart = Cart.objects.get(user=request.user)
            item = cart.items.get(pk=item_id)
            item.delete()
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({'error': 'Item not found.'}, status=404)

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


# ── Orders ────────────────────────────────────────────────

class OrderListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Checkout: create order from cart
        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.items.exists():
            return Response({'error': 'Cart is empty.'}, status=400)

        subtotal = sum(
            item.product.price * item.quantity for item in cart.items.all()
        )
        estimated_delivery = date.today() + timedelta(days=5)

        order = Order.objects.create(
            user=request.user,
            order_number=generate_order_number(),
            status='Order Placed',
            subtotal=subtotal,
            estimated_delivery=estimated_delivery,
        )

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                name=item.product.name,
                category=item.product.category.name if item.product.category else '',
                price=item.product.price,
                size=item.size,
                quantity=item.quantity,
            )

        # Clear cart after checkout
        cart.items.all().delete()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=201)


class AdminOrderListView(generics.ListAPIView):
    """All orders — admin only"""
    serializer_class   = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not (user.role == 'admin' or user.is_staff or user.is_superuser):
            return Order.objects.none()
        return Order.objects.all().order_by('-created_at')


class AdminOrderUpdateView(APIView):
    """Update order status — admin only"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        if not (user.role == 'admin' or user.is_staff or user.is_superuser):
            return Response({'error': 'Forbidden.'}, status=403)

        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=404)

        status_val = request.data.get('status')
        valid = [c[0] for c in Order.STATUS_CHOICES]
        if status_val not in valid:
            return Response({'error': f'Invalid status. Must be one of: {valid}'}, status=400)

        order.status = status_val
        order.save()
        return Response(OrderSerializer(order).data)


class BlogPostListCreateView(APIView):
    def get_permissions(self):
        return [AllowAny()] if self.request.method == 'GET' else [IsAuthenticated()]

    def get(self, request):
        posts = BlogPost.objects.all()
        serializer = BlogPostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BlogPostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, source='user')
        return Response(serializer.data, status=201)


class BlogPostDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            post = BlogPost.objects.get(pk=pk)
        except BlogPost.DoesNotExist:
            return Response({'error': 'Post not found.'}, status=404)

        if post.user != request.user and not (request.user.is_staff or request.user.role == 'admin'):
            return Response({'error': 'Forbidden.'}, status=403)

        post.delete()
        return Response({'detail': 'Post deleted.'})

class AboutReviewListCreateView(APIView):
    def get_permissions(self):
        return [AllowAny()] if self.request.method == 'GET' else [IsAuthenticated()]

    def get(self, request):
        reviews = AboutReview.objects.all()
        return Response(AboutReviewSerializer(reviews, many=True).data)

    def post(self, request):
        if AboutReview.objects.filter(user=request.user, product=request.data.get('product')).exists():
            return Response(
                {'error': 'You have already reviewed this product.'},
                status=400
            )
        serializer = AboutReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)


