from django.contrib import admin
from .models import AboutReview, BlogPost, CustomUser, Product, Section, SubSection, Badge, Category, ChatMessage, ChatSession, Cart, CartItem, Order, OrderItem, ProductImage, Review, UserProfile

admin.site.register(CustomUser)
admin.site.register(Product)
admin.site.register(Section)
admin.site.register(SubSection)
admin.site.register(Badge)
admin.site.register(Category)
admin.site.register(BlogPost)
admin.site.register(AboutReview)
admin.site.register(ChatMessage)
admin.site.register(ChatSession)