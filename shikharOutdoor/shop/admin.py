from django.contrib import admin
from .models import AboutReview, BlogPost, CustomUser, Product, Section, SubSection, Badge, Category

admin.site.register(CustomUser)
admin.site.register(Product)
admin.site.register(Section)
admin.site.register(SubSection)
admin.site.register(Badge)
admin.site.register(Category)
admin.site.register(BlogPost)
admin.site.register(AboutReview)