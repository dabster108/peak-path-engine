# shikharOutdoor\shop\views.py
from datetime import date, timedelta
import random
import json, secrets, string, urllib.request
from urllib.error import HTTPError, URLError

from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests

from django.conf import settings
# FIX: use Django's timezone, not datetime.timezone — datetime.timezone has no .now()
from django.utils import timezone

from .models import (
    AboutReview, BlogPost, Cart, CartItem, ChatMessage, ChatSession,
    CustomUser, Order, OrderItem, Product, ProductImage, Review,
    Section, Badge, Category, SubSection, UserProfile,
)
from .serializers import (
    AboutReviewSerializer,
    BadgeSerializer,
    BlogPostSerializer,
    CartSerializer,
    CategorySerializer,
    ChatMessageSerializer,
    ChatSessionSerializer,
    OrderSerializer,
    ProductImageSerializer,
    ProductSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    LoginSerializer,
    ReviewSerializer,
    SectionSerializer,
    SubSectionSerializer,
    UserListSerializer,
    UserProfileSerializer,
    UserSerializer,
    ProfileSettingsSerializer,
    ChangePasswordSerializer,
    GoogleAuthSerializer,
)


# ── Helpers ───────────────────────────────────────────────

def error_response(message, status=400, code="error"):
    return Response({"detail": message, "code": code}, status=status)


DEFAULT_CATEGORY_NAMES = ["Men", "Women"]
DEFAULT_SECTION_NAMES = [
    "Jackets", "Footwear", "Backpacks", "Bottles",
    "Equipment", "Gore-Tex", "Apparel", "Accessories",
]

BOT_REPLIES = [
    "Thanks for reaching out! Our gear specialists will be with you shortly.",
    "Great question! For sizing advice, we recommend checking our size guide or sharing your height and weight.",
    "We carry a wide range of mountain gear. Could you tell me more about your planned trek?",
    "For high-altitude treks, we recommend our Gore-Tex shells paired with a down mid-layer. Want more details?",
    "Our team typically replies within a few minutes. In the meantime, feel free to browse our collections!",
    "That product is very popular! Would you like to know more about its features or availability?",
]



def generate_order_number():
    alphabet = string.ascii_uppercase + string.digits
    for _ in range(10):
        suffix = ''.join(secrets.choice(alphabet) for _ in range(8))
        candidate = f"SKR-{suffix}"
        if not Order.objects.filter(order_number=candidate).exists():
            return candidate
    raise RuntimeError("Could not generate a unique order number after 10 attempts.")


# ── Simple paginator used by list views ──────────────────

class StandardPagination(PageNumberPagination):
    page_size            = 20
    page_size_query_param = 'page_size'
    max_page_size        = 100


# ── Auth ─────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    serializer_class  = RegisterSerializer
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
            "access":  str(refresh.access_token),
            "user":    UserSerializer(user).data,
        })


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

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

        base_username = email.split("@")[0]
        user, created = CustomUser.objects.get_or_create(email=email)
        if created:
            user.username   = base_username
            user.first_name = user_info.get("given_name", "")
            user.last_name  = user_info.get("family_name", "")
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "access":  str(refresh.access_token),
            "refresh": str(refresh),
            "user":    UserSerializer(user).data,
        })


# ── Profile ───────────────────────────────────────────────

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class  = UserSerializer
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
        profile    = self._get_profile(request.user)
        serializer = UserProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        profile    = self._get_profile(request.user)
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
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"detail": "Password updated successfully."})


class UserListView(generics.ListAPIView):
    serializer_class  = UserListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class  = StandardPagination

    def get_queryset(self):
        if self.request.user.role != "admin" and not self.request.user.is_staff:
            return CustomUser.objects.none()
        return CustomUser.objects.all().order_by("-date_joined")


# ── Products ──────────────────────────────────────────────

class AddProductView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        data = {
            "name":           request.data.get("name"),
            "description":    request.data.get("description", ""),
            "category":       request.data.get("category"),
            "section":        request.data.get("section"),
            "sub_section":    request.data.get("sub_section") or None,
            "badge":          request.data.get("badge") or None,
            "original_price": request.data.get("original_price") or None,
            "price":          request.data.get("price"),
            "stock":          request.data.get("stock"),
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
        return Response(ProductSerializer(product, context={"request": request}).data, status=201)


class ProductListView(generics.ListAPIView):
    serializer_class  = ProductSerializer
    permission_classes = [AllowAny]
    queryset          = Product.objects.all()
    pagination_class  = StandardPagination



class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    queryset         = Product.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        data = request.data.copy()

        sub_section_name = data.pop('sub_section', None)
        if isinstance(sub_section_name, list):
            sub_section_name = sub_section_name[0] if sub_section_name else None

        section_name = data.get('section')
        if isinstance(section_name, list):
            section_name = section_name[0]

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()

        if sub_section_name is not None:
            if sub_section_name in ("", "null"):
                product.sub_section = None
            else:
                section = product.section
                if section:
                    sub, _ = SubSection.objects.get_or_create(
                        name=sub_section_name, section=section
                    )
                    product.sub_section = sub
            product.save()

        return Response(ProductSerializer(product, context={'request': request}).data)


# ── Dropdowns ─────────────────────────────────────────────


class CategoryListView(generics.ListAPIView):
    serializer_class  = CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Ensure the default categories always exist
        for name in DEFAULT_CATEGORY_NAMES:
            Category.objects.get_or_create(name=name)
        return Category.objects.all().order_by("name")


class SectionListView(generics.ListAPIView):
    serializer_class  = SectionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        for name in DEFAULT_SECTION_NAMES:
            Section.objects.get_or_create(name=name)
        return Section.objects.all().order_by("name")


class SubSectionListView(generics.ListAPIView):
    serializer_class  = SubSectionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        section = self.request.query_params.get('section')
        qs = SubSection.objects.select_related('section').all()
        if section:
            qs = qs.filter(section__name__iexact=section)
        return qs


class BadgeListView(generics.ListAPIView):
    serializer_class  = BadgeSerializer
    permission_classes = [AllowAny]
    queryset          = Badge.objects.all()


# ── Product Images ────────────────────────────────────────

class ProductImageUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

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
            is_primary = (i == 0 and not product.images.exists())
            img = ProductImage.objects.create(
                product=product,
                image=image_file,
                is_primary=is_primary,
                order=product.images.count(),
            )
            created.append(img)

        serializer = ProductImageSerializer(created, many=True, context={"request": request})
        return Response(serializer.data, status=201)

    def delete(self, request, pk):
        image_id = request.data.get("image_id")
        try:
            image = ProductImage.objects.get(pk=image_id, product__pk=pk)
            image.image.delete(save=False)
            image.delete()
            return Response({"detail": "Image deleted."})
        except ProductImage.DoesNotExist:
            return Response({"error": "Image not found."}, status=404)


# ── Reviews ───────────────────────────────────────────────

class ReviewListCreateView(APIView):
    def get_permissions(self):
        return [AllowAny()] if self.request.method == 'GET' else [IsAuthenticated()]

    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return error_response('Product not found.', 404, 'product_not_found')
        reviews = product.reviews.all()
        return Response(ReviewSerializer(reviews, many=True).data)

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return error_response('Product not found.', 404, 'product_not_found')

        if Review.objects.filter(product=product, user=request.user).exists():
            return error_response('You have already reviewed this product.', 400, 'already_reviewed')

        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product, user=request.user)
        return Response(serializer.data, status=201)


# ── Cart ──────────────────────────────────────────────────

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response({'detail': 'Cart cleared.'})


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        size       = request.data.get('size', 'Medium')
        quantity   = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return error_response('Product not found.', 404, 'product_not_found')

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
        try:
            cart = Cart.objects.get(user=request.user)
            item = cart.items.get(pk=item_id)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return error_response('Item not found.', 404, 'item_not_found')

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
            return error_response('Item not found.', 404, 'item_not_found')

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


# ── Orders ────────────────────────────────────────────────

class OrderListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders     = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.items.exists():
            return error_response('Cart is empty.', 400, 'cart_empty')

        subtotal           = sum(item.product.price * item.quantity for item in cart.items.all())
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

        cart.items.all().delete()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=201)


class AdminOrderListView(generics.ListAPIView):
    """All orders — admin only."""
    serializer_class  = OrderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class  = StandardPagination

    def get_queryset(self):
        user = self.request.user
        if not (user.role == 'admin' or user.is_staff or user.is_superuser):
            return Order.objects.none()
        return Order.objects.all().order_by('-created_at')


class AdminOrderUpdateView(APIView):
    """Update order status — admin only."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        if not (user.role == 'admin' or user.is_staff or user.is_superuser):
            return error_response('Forbidden.', 403, 'forbidden')

        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return error_response('Order not found.', 404, 'order_not_found')

        status_val = request.data.get('status')
        valid = [c[0] for c in Order.STATUS_CHOICES]
        if status_val not in valid:
            return error_response(f'Invalid status. Must be one of: {valid}', 400, 'invalid_status')

        order.status = status_val
        order.save()
        return Response(OrderSerializer(order).data)


# ── Blog ──────────────────────────────────────────────────

class BlogPostListCreateView(APIView):
    def get_permissions(self):
        return [AllowAny()] if self.request.method == 'GET' else [IsAuthenticated()]

    def get(self, request):
        posts      = BlogPost.objects.all()
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
            return error_response('Post not found.', 404, 'post_not_found')

        if post.user != request.user and not (request.user.is_staff or request.user.role == 'admin'):
            return error_response('Forbidden.', 403, 'forbidden')

        post.delete()
        return Response({'detail': 'Post deleted.'})


# ── About Reviews ─────────────────────────────────────────

class AboutReviewListCreateView(APIView):
    def get_permissions(self):
        return [AllowAny()] if self.request.method == 'GET' else [IsAuthenticated()]

    def get(self, request):
        reviews = AboutReview.objects.all()
        return Response(AboutReviewSerializer(reviews, many=True).data)

    def post(self, request):
        if AboutReview.objects.filter(user=request.user, product=request.data.get('product')).exists():
            return Response({'error': 'You have already reviewed this product.'}, status=400)

        serializer = AboutReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)


# ── Chat ──────────────────────────────────────────────────

class ChatSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        session, _ = ChatSession.objects.get_or_create(
            user=request.user, defaults={'is_active': True}
        )
        session.messages.filter(sender__in=['admin', 'bot'], read=False).update(read=True)
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data)

    def post(self, request):
        """Send a message from user."""
        text = request.data.get('text', '').strip()
        if not text:
            return error_response('Message cannot be empty.', 400, 'empty_message')

        session, _ = ChatSession.objects.get_or_create(user=request.user)
        ChatMessage.objects.create(session=session, sender='user', text=text)
        session.save()  # update updated_at

        # FIX: django.utils.timezone.now() — previously used datetime.timezone which has no .now()
        two_mins_ago = timezone.now() - timedelta(minutes=2)
        admin_active = session.messages.filter(
            sender='admin', created_at__gte=two_mins_ago
        ).exists()

        if not admin_active:
            bot_text = random.choice(BOT_REPLIES)
            ChatMessage.objects.create(session=session, sender='bot', text=bot_text)

        serializer = ChatSessionSerializer(session)
        return Response(serializer.data, status=201)


class AdminChatListView(APIView):
    """Admin: list all chat sessions."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff or request.user.role == 'admin' or request.user.is_superuser):
            return error_response('Forbidden.', 403, 'forbidden')
        sessions   = ChatSession.objects.all().prefetch_related('messages')
        serializer = ChatSessionSerializer(sessions, many=True)
        return Response(serializer.data)


class AdminChatReplyView(APIView):
    """Admin: reply to a chat session."""
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        if not (request.user.is_staff or request.user.role == 'admin' or request.user.is_superuser):
            return error_response('Forbidden.', 403, 'forbidden')

        try:
            session = ChatSession.objects.get(pk=session_id)
        except ChatSession.DoesNotExist:
            return error_response('Session not found.', 404, 'session_not_found')

        text = request.data.get('text', '').strip()
        if not text:
            return error_response('Message cannot be empty.', 400, 'empty_message')

        session.messages.filter(sender='user', read=False).update(read=True)
        message = ChatMessage.objects.create(session=session, sender='admin', text=text)
        session.save()

        return Response(ChatMessageSerializer(message).data, status=201)
    
class AdminChatMarkReadView(APIView):
    """Admin: mark all user messages in a session as read."""
    permission_classes = [IsAuthenticated]
 
    def post(self, request, session_id):
        if not (request.user.is_staff or request.user.role == 'admin' or request.user.is_superuser):
            return error_response('Forbidden.', 403, 'forbidden')
 
        try:
            session = ChatSession.objects.get(pk=session_id)
        except ChatSession.DoesNotExist:
            return error_response('Session not found.', 404, 'session_not_found')
 
        session.messages.filter(sender='user', read=False).update(read=True)
        return Response({'detail': 'Messages marked as read.'})
 
