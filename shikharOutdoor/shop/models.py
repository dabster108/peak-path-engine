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

class ProductImage(models.Model):
    product = models.ForeignKey(
        'Product',
        related_name='images',
        on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to='products/')
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Image for {self.product.name}"
    
class Cart(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name='cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.user.username}"


class CartItem(models.Model):
    cart    = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    size    = models.CharField(max_length=10)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('cart', 'product', 'size')

    def __str__(self):
        return f"{self.quantity}x {self.product.name} ({self.size})"


class Order(models.Model):
    STATUS_CHOICES = [
        ('Order Placed',     'Order Placed'),
        ('Confirmed',        'Confirmed'),
        ('Packed',           'Packed'),
        ('Out for Delivery', 'Out for Delivery'),
        ('Delivered',        'Delivered'),
    ]

    user           = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='orders')
    order_number   = models.CharField(max_length=20, unique=True)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Order Placed')
    subtotal       = models.DecimalField(max_digits=12, decimal_places=2)
    created_at     = models.DateTimeField(auto_now_add=True)
    estimated_delivery = models.DateField()

    def __str__(self):
        return f"Order {self.order_number} by {self.user.username}"


class OrderItem(models.Model):
    order    = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product  = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    name     = models.CharField(max_length=255)   # snapshot name at time of order
    category = models.CharField(max_length=100, blank=True)
    price    = models.DecimalField(max_digits=10, decimal_places=2)
    size     = models.CharField(max_length=10)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.quantity}x {self.name}"