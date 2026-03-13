import json
import urllib.request
from urllib.error import HTTPError, URLError

from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests

from django.conf import settings

from .models import CustomUser
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    GoogleAuthSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class LoginView(APIView):

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

    def post(self, request):

        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["token"]

        user_info = None

        # The token may be an OIDC ID token (JWT) or an OAuth2 access token.
        # Try validating it as an ID token first (recommended), otherwise
        # fall back to fetching user info from Google using the access token.
        if token.count(".") == 2:
            try:
                user_info = id_token.verify_oauth2_token(
                    token,
                    requests.Request(),
                    settings.GOOGLE_CLIENT_ID,
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

        # Prefer a full name from Google; fall back to the email username part.
        username = (
            user_info.get("name")
            or f"{user_info.get('given_name', '')} {user_info.get('family_name', '')}".strip()
            or email.split("@")[0]
        )

        user_defaults = {
            "username": username,
            "first_name": user_info.get("given_name", ""),
            "last_name": user_info.get("family_name", ""),
        }

        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults=user_defaults,
        )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        })


class ProfileView(generics.RetrieveAPIView):

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user