# shikharOutdoor\shop\urls.py
from django.urls import path
from . import views

urlpatterns = [

    path("register/", views.RegisterView.as_view()),
    path("login/", views.LoginView.as_view()),
    path("google-login/", views.GoogleLoginView.as_view()),
    path("profile/", views.ProfileView.as_view()),
    path("change-password/", views.ChangePasswordView.as_view()),
    path("users/", views.UserListView.as_view()),
    path("add-product/", views.AddProductView.as_view()),
    path("products/<int:pk>/images/", views.ProductImageUploadView.as_view()),
    path("products/", views.ProductListView.as_view()),
    path("products/<int:pk>/", views.ProductDetailView.as_view()),
    path("categories/", views.CategoryListView.as_view()),
    path("sections/",   views.SectionListView.as_view()),
    path("badges/",     views.BadgeListView.as_view()),
]