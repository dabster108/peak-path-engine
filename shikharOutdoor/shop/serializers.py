# shikharOutdoor\shop\serializers.py
from rest_framework import serializers
from .models import (
    AboutReview, BlogPost, Cart, CartItem, ChatMessage, ChatSession,
    CustomUser, Order, OrderItem, Product, ProductImage, Review,
    Section, Badge, Category, SubSection, UserProfile,
)
import re
from django.contrib.auth.password_validation import validate_password


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "is_staff",
            "is_superuser",
        )


class UserProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model  = UserProfile
        fields = (
            "phone", "bio", "avatar",
            "address_line", "city", "state",
            "postal_code", "country", "location",
        )

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get("request")
        if instance.avatar and request:
            rep["avatar"] = request.build_absolute_uri(instance.avatar.url)
        else:
            rep["avatar"] = instance.avatar.url if instance.avatar else None
        return rep


class ProfileSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("username", "first_name", "last_name", "email")

    def validate_email(self, value):
        email = value.lower()
        user = self.instance
        if CustomUser.objects.exclude(pk=user.pk).filter(email__iexact=email).exists():
            raise serializers.ValidationError("This email is already in use.")
        return email


# FIX: Only one ChangePasswordSerializer — uses Django's validate_password for strength checks
class ChangePasswordSerializer(serializers.Serializer):
    old_password     = serializers.CharField(write_only=True)
    new_password     = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "New passwords do not match."})

        user = self.context["request"].user
        validate_password(attrs["new_password"], user=user)
        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        # username is intentionally excluded from fields since it is auto-generated from email
        fields = ("email", "password")

    def validate_email(self, value):
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        base = re.sub(r'[^\w.@+-]', '', validated_data["email"].split("@")[0].replace(" ", "_")).strip("_") \
               or validated_data["email"].split("@")[0]

        username = base
        counter = 1
        while CustomUser.objects.filter(username=username).exists():
            username = f"{base}{counter}"
            counter += 1

        return CustomUser.objects.create_user(
            username=username,
            email=validated_data["email"],
            password=validated_data["password"],
        )


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        email_or_username = data["username"]
        password = data["password"]

        try:
            user = CustomUser.objects.get(email=email_or_username)
        except CustomUser.DoesNotExist:
            try:
                user = CustomUser.objects.get(username=email_or_username)
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError("Invalid credentials")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials")

        if not user.is_active:
            raise serializers.ValidationError("User is inactive")

        data["user"] = user
        return data


class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField()


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ("id", "image", "is_primary", "order")

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


class ProductSerializer(serializers.ModelSerializer):
    category    = serializers.CharField(source='category.name', allow_null=True, required=False)
    section     = serializers.CharField(source='section.name')
    sub_section = serializers.CharField(source='sub_section.name', allow_null=True, required=False)
    badge       = serializers.CharField(source='badge.name', allow_null=True, required=False)
    images      = ProductImageSerializer(many=True, read_only=True)
    description = serializers.CharField(allow_blank=True, required=False, default="")

    class Meta:
        model  = Product
        fields = (
            "id", "name", "description", "category", "section", "sub_section",
            "badge", "original_price", "price", "stock", "images",
        )

    def _get_or_create_related(self, model, name):
        if not name:
            return None
        obj, _ = model.objects.get_or_create(name=name)
        return obj

    def _extract_name(self, value):
        """Value arrives as dict {'name': '...'} from source mapping, or plain string."""
        if isinstance(value, dict):
            return value.get('name') or None
        return value or None

    def create(self, validated_data):
        category_raw    = validated_data.pop('category',    None)
        section_raw     = validated_data.pop('section',     {})
        sub_section_raw = validated_data.pop('sub_section', None)
        badge_raw       = validated_data.pop('badge',       None)

        category_name    = self._extract_name(category_raw)
        section_name     = self._extract_name(section_raw)
        sub_section_name = self._extract_name(sub_section_raw)
        badge_name       = self._extract_name(badge_raw)

        section = self._get_or_create_related(Section, section_name)

        sub_section = None
        if sub_section_name and section:
            sub_section, _ = SubSection.objects.get_or_create(
                name=sub_section_name, section=section
            )

        return Product.objects.create(
            category=self._get_or_create_related(Category, category_name),
            section=section,
            sub_section=sub_section,
            badge=self._get_or_create_related(Badge, badge_name),
            **validated_data,
        )

    def update(self, instance, validated_data):
        category_raw    = validated_data.pop('category',    None)
        section_raw     = validated_data.pop('section',     None)
        validated_data.pop('sub_section', None)
        badge_raw       = validated_data.pop('badge',       None)

        category_name = self._extract_name(category_raw)
        section_name  = self._extract_name(section_raw)
        badge_name    = self._extract_name(badge_raw)

        if category_name is not None:
            instance.category = self._get_or_create_related(Category, category_name)
        if section_name is not None:
            instance.section = self._get_or_create_related(Section, section_name)
        if badge_name is not None:
            instance.badge = self._get_or_create_related(Badge, badge_name)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ReviewSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()

    class Meta:
        model  = Review
        fields = ('id', 'author', 'rating', 'text', 'date')

    def get_date(self, obj):
        return obj.created_at.strftime('%b %Y')

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name")


class SubSectionSerializer(serializers.ModelSerializer):
    section = serializers.CharField(source='section.name', read_only=True)

    class Meta:
        model  = SubSection
        fields = ('id', 'name', 'description', 'section', 'order')


class SectionSerializer(serializers.ModelSerializer):
    sub_sections = SubSectionSerializer(many=True, read_only=True)

    class Meta:
        model  = Section
        fields = ('id', 'name', 'sub_sections')


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ("id", "name")


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("username", "first_name", "last_name", "email")

    def validate_email(self, value):
        user = self.instance
        if CustomUser.objects.filter(email__iexact=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value.lower()

    def validate_username(self, value):
        user = self.instance
        if CustomUser.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("id", "username", "first_name", "last_name", "email", "role", "is_staff", "is_superuser")


class CartItemSerializer(serializers.ModelSerializer):
    product_id       = serializers.IntegerField(source='product.id', read_only=True)
    product_name     = serializers.CharField(source='product.name', read_only=True)
    product_category = serializers.CharField(source='product.category.name', read_only=True)
    price            = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    image            = serializers.SerializerMethodField()

    class Meta:
        model  = CartItem
        fields = ('id', 'product_id', 'product_name', 'product_category', 'price', 'size', 'quantity', 'image')

    def get_image(self, obj):
        request = self.context.get('request')
        images = obj.product.images.all()
        primary = images.filter(is_primary=True).first() or images.first()
        if primary and request:
            return request.build_absolute_uri(primary.image.url)
        return None


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model  = Cart
        fields = ('id', 'items', 'updated_at')


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = OrderItem
        fields = ('id', 'product_id', 'name', 'category', 'price', 'size', 'quantity')


class OrderSerializer(serializers.ModelSerializer):
    items         = OrderItemSerializer(many=True, read_only=True)
    status_label  = serializers.CharField(source='status', read_only=True)
    status_index  = serializers.SerializerMethodField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email    = serializers.CharField(source='user.email', read_only=True)

    ORDER_STAGES = [
        'Order Placed', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered'
    ]

    class Meta:
        model  = Order
        fields = (
            'id', 'order_number', 'status', 'status_label', 'status_index',
            'subtotal', 'created_at', 'estimated_delivery',
            'items', 'user_username', 'user_email'
        )

    def get_status_index(self, obj):
        try:
            return self.ORDER_STAGES.index(obj.status)
        except ValueError:
            return 0


class BlogPostSerializer(serializers.ModelSerializer):
    created_at = serializers.SerializerMethodField()

    class Meta:
        model  = BlogPost
        fields = ('id', 'title', 'category', 'author', 'excerpt', 'content', 'source', 'created_at')
        read_only_fields = ('id', 'source', 'created_at')

    def get_created_at(self, obj):
        return obj.created_at.isoformat()

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title is required.")
        return value.strip()

    def validate_excerpt(self, value):
        if not value.strip():
            raise serializers.ValidationError("Summary is required.")
        return value.strip()

    def validate_content(self, value):
        if len(value.strip()) < 120:
            raise serializers.ValidationError("Content must be at least 120 characters.")
        return value.strip()


class AboutReviewSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()

    class Meta:
        model  = AboutReview
        fields = ('id', 'name', 'location', 'product', 'rating', 'text', 'date')
        read_only_fields = ('id', 'date')

    def get_date(self, obj):
        return obj.created_at.strftime('%b %Y')

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate_text(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError("Review must be at least 20 characters.")
        return value.strip()

    def validate_product(self, value):
        if not value.strip():
            raise serializers.ValidationError("Please select a product.")
        return value.strip()


# Chat Bot Serializers

class ChatMessageSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField()

    class Meta:
        model  = ChatMessage
        fields = ('id', 'sender', 'text', 'time', 'read')

    def get_time(self, obj):
        return obj.created_at.strftime('%H:%M')


class ChatSessionSerializer(serializers.ModelSerializer):
    messages      = ChatMessageSerializer(many=True, read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email    = serializers.CharField(source='user.email',    read_only=True)
    unread_count  = serializers.SerializerMethodField()
    last_message  = serializers.SerializerMethodField()

    class Meta:
        model  = ChatSession
        fields = ('id', 'user_username', 'user_email', 'messages',
                  'unread_count', 'last_message', 'updated_at', 'is_active')

    def get_unread_count(self, obj):
        return obj.messages.filter(read=False, sender='user').count()

    def get_last_message(self, obj):
        last = obj.messages.last()
        return last.text[:60] if last else ""
    

    