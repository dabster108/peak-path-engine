from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = [('user', 'User'), ('admin', 'Admin')]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")

    def __str__(self):
        return self.username


class Category(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Section(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Badge(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Product(models.Model):
    name     = models.CharField(max_length=255)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.SET_NULL, null=True, blank=True)
    section  = models.ForeignKey(Section,  related_name='products', on_delete=models.CASCADE)
    badge    = models.ForeignKey(Badge,    related_name='products', on_delete=models.SET_NULL, null=True, blank=True)
    price    = models.DecimalField(max_digits=10, decimal_places=2)
    stock    = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name