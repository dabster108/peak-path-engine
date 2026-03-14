# shikharOutdoor\shop\serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser
import re


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ("id", "username", "first_name", "last_name", "email", "role")


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