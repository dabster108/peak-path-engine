from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path("register/",        views.RegisterView.as_view()),
    path("login/",           views.LoginView.as_view()),
    path("google-login/",    views.GoogleLoginView.as_view()),
    path("profile/",         views.ProfileView.as_view()),
    path("profile/extended/", views.UserProfileView.as_view()),
    path("change-password/", views.ChangePasswordView.as_view()),
    path("users/",           views.UserListView.as_view()),

    # Products
    path("products/",          views.ProductListView.as_view()),
    path("add-product/",       views.AddProductView.as_view()),
    path("products/<int:pk>/", views.ProductDetailView.as_view()),
    path("products/<int:pk>/images/", views.ProductImageUploadView.as_view()),
    path("products/<int:pk>/reviews/", views.ReviewListCreateView.as_view()),

    # Dropdowns
    path("categories/", views.CategoryListView.as_view()),
    path("sections/",   views.SectionListView.as_view()),
    path("sub-sections/", views.SubSectionListView.as_view()),
    path("badges/",     views.BadgeListView.as_view()),

    # Cart
    path("cart/",                    views.CartView.as_view()),
    path("cart/items/",              views.CartItemView.as_view()),
    path("cart/items/<int:item_id>/", views.CartItemView.as_view()),

    # Orders
    path("orders/",                views.OrderListCreateView.as_view()),
    path("admin/orders/",          views.AdminOrderListView.as_view()),
    path("admin/orders/<int:pk>/", views.AdminOrderUpdateView.as_view()),

    # Blogs
    path("blog/",          views.BlogPostListCreateView.as_view()),
    path("blog/<int:pk>/", views.BlogPostDeleteView.as_view()),


    # About
    path("about/reviews/", views.AboutReviewListCreateView.as_view()),

]