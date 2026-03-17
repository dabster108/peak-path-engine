# shikharOutdoor\shop\serializers.py
from rest_framework import serializers
from .models import CustomUser, Product, Section, Badge, Category
import re


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


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ("username", "email", "password")

    def validate_email(self, value):
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        # Sanitize: strip spaces/special chars, fallback to email prefix
        raw = validated_data.get("username") or validated_data["email"].split("@")[0]
        base = re.sub(r'[^\w.@+-]', '', raw.replace(" ", "_")).strip("_") \
               or validated_data["email"].split("@")[0]

        # Ensure uniqueness
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

class ProductSerializer(serializers.ModelSerializer):
    # Read as string names, write as string names
    category = serializers.CharField(source='category.name', allow_null=True, required=False)
    section  = serializers.CharField(source='section.name')
    badge    = serializers.CharField(source='badge.name', allow_null=True, required=False)

    class Meta:
        model = Product
        fields = ("id", "name", "category", "section", "badge", "price", "stock")

    def _get_or_create_related(self, model, name):
        if not name:
            return None
        obj, _ = model.objects.get_or_create(name=name)
        return obj

    def create(self, validated_data):
        category_name = (validated_data.pop('category', None) or {}).get('name')
        section_name  = (validated_data.pop('section', {})).get('name')
        badge_name    = (validated_data.pop('badge', None) or {}).get('name')

        return Product.objects.create(
            category=self._get_or_create_related(Category, category_name),
            section=self._get_or_create_related(Section, section_name),
            badge=self._get_or_create_related(Badge, badge_name),
            **validated_data,
        )

    def update(self, instance, validated_data):
        category_name = (validated_data.pop('category', None) or {}).get('name')
        section_name  = (validated_data.pop('section', {}) or {}).get('name')
        badge_name    = (validated_data.pop('badge', None) or {}).get('name')

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
    

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name")

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ("id", "name")

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ("id", "name")