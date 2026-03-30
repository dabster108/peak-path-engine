from django.contrib import admin
from .models import AboutReview, BlogPost, CustomUser, Product, Section, Badge, Category

admin.site.register(CustomUser)
admin.site.register(Product)
admin.site.register(Section)
admin.site.register(Badge)
admin.site.register(Category)
admin.site.register(BlogPost)
admin.site.register(AboutReview)