# 🔌 API Documentation

## Base URL

```
Development: http://127.0.0.1:8000/api/
Production: https://yourdomain.com/api/
```

All requests should include the `Content-Type: application/json` header.

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Products](#products)
3. [Categories & Sections](#categories--sections)
4. [Cart](#cart)
5. [Orders](#orders)
6. [Reviews](#reviews)
7. [User Profile](#user-profile)
8. [Blog](#blog)
9. [Chat](#chat)
10. [Error Handling](#error-handling)

---

## 🔐 Authentication

### Register User

```http
POST /api/users/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  }
}
```

### Login

```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  }
}
```

**Errors:**
- `401`: Invalid credentials
- `400`: Email or password missing

### Google OAuth Login

```http
POST /api/google-login/
Content-Type: application/json

{
  "token": "google_id_token_here"
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "first_name": "John",
    "role": "customer"
  }
}
```

### Refresh Token

```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Logout

```http
POST /api/auth/logout/
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "detail": "Logged out successfully."
}
```

---

## 🛍️ Products

### List All Products

```http
GET /api/products/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `search` - Search term for product name
- `category` - Filter by category name
- `section` - Filter by section name

**Response (200):**
```json
{
  "count": 125,
  "next": "http://api.example.com/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Alpine Jacket Pro",
      "description": "Premium winter jacket",
      "price": "299.99",
      "original_price": "399.99",
      "stock": 50,
      "badge": "new",
      "category": "Jackets",
      "section": "Men",
      "sub_section": "Winter",
      "images": [
        {
          "id": 1,
          "image": "https://cdn.example.com/products/jacket.jpg",
          "is_default": true
        }
      ],
      "created_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

### Get Product Details

```http
GET /api/products/{id}/
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Alpine Jacket Pro",
  "description": "Premium winter jacket with waterproof technology",
  "price": "299.99",
  "original_price": "399.99",
  "stock": 50,
  "badge": "new",
  "category": {
    "id": 1,
    "name": "Jackets"
  },
  "section": {
    "id": 2,
    "name": "Men"
  },
  "sub_section": {
    "id": 5,
    "name": "Winter"
  },
  "images": [
    {
      "id": 1,
      "image": "https://cdn.example.com/products/jacket.jpg",
      "is_default": true
    }
  ],
  "reviews": [
    {
      "id": 1,
      "user": "John Doe",
      "rating": 5,
      "text": "Excellent quality!",
      "created_at": "2026-01-20T15:45:00Z"
    }
  ],
  "created_at": "2026-01-15T10:30:00Z"
}
```

### Create Product (Admin Only)

```http
POST /api/products/
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "New Jacket",
  "description": "Description here",
  "price": "199.99",
  "original_price": "299.99",
  "stock": 100,
  "category": 1,
  "section": 2,
  "sub_section": 5,
  "badge": "new",
  "images": [file1, file2]
}
```

**Response (201):**
```json
{
  "id": 123,
  "name": "New Jacket",
  "description": "Description here",
  "price": "199.99",
  "original_price": "299.99",
  "stock": 100,
  "images": [
    {
      "id": 45,
      "image": "https://cdn.example.com/products/new-jacket.jpg",
      "is_default": true
    }
  ]
}
```

### Update Product (Admin Only)

```http
PATCH /api/products/{id}/
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Jacket",
  "price": "189.99",
  "stock": 95
}
```

**Response (200):**
```json
{
  "id": 123,
  "name": "Updated Jacket",
  "price": "189.99",
  "stock": 95
}
```

### Delete Product (Admin Only)

```http
DELETE /api/products/{id}/
Authorization: Bearer <admin_token>
```

**Response (204):** No content

---

## 📦 Categories & Sections

### List Categories

```http
GET /api/categories/
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Men"
  },
  {
    "id": 2,
    "name": "Women"
  }
]
```

### List Sections

```http
GET /api/sections/
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Jackets",
    "category": 1,
    "sub_sections": [
      {
        "id": 5,
        "name": "Winter"
      },
      {
        "id": 6,
        "name": "Summer"
      }
    ]
  }
]
```

### List Sub-Sections

```http
GET /api/sub-sections/
```

**Response (200):**
```json
[
  {
    "id": 5,
    "name": "Winter",
    "section": 1
  }
]
```

---

## 🛒 Cart

### Get Cart

```http
GET /api/cart/
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "user": 1,
  "items": [
    {
      "id": 10,
      "product": {
        "id": 1,
        "name": "Alpine Jacket Pro",
        "price": "299.99"
      },
      "quantity": 2,
      "size": "Medium"
    }
  ],
  "total": "599.98",
  "count": 2
}
```

### Add to Cart

```http
POST /api/cart/items/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2,
  "size": "Medium"
}
```

**Response (201):**
```json
{
  "id": 10,
  "product": {
    "id": 1,
    "name": "Alpine Jacket Pro",
    "price": "299.99"
  },
  "quantity": 2,
  "size": "Medium"
}
```

**Errors:**
- `404`: Product not found
- `400`: Invalid quantity

### Update Cart Item

```http
PATCH /api/cart/items/{item_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "quantity": 3
}
```

**Response (200):**
```json
{
  "id": 10,
  "product": {
    "id": 1,
    "name": "Alpine Jacket Pro"
  },
  "quantity": 3,
  "size": "Medium"
}
```

### Remove from Cart

```http
DELETE /api/cart/items/{item_id}/
Authorization: Bearer <access_token>
```

**Response (204):** No content

---

## 📦 Orders

### Create Order (Checkout)

```http
POST /api/orders/checkout/
Authorization: Bearer <access_token>
```

**Response (201):**
```json
{
  "id": 100,
  "order_number": "ORD-20260104-100",
  "user": 1,
  "items": [
    {
      "id": 50,
      "product": 1,
      "quantity": 2,
      "price": "299.99"
    }
  ],
  "subtotal": "599.98",
  "status": "Order Placed",
  "estimated_delivery": "2026-01-09",
  "created_at": "2026-01-04T10:30:00Z"
}
```

**Errors:**
- `400`: Cart is empty
- `401`: Not authenticated

### List User Orders

```http
GET /api/orders/
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "id": 100,
    "order_number": "ORD-20260104-100",
    "subtotal": "599.98",
    "status": "Delivered",
    "created_at": "2026-01-04T10:30:00Z",
    "estimated_delivery": "2026-01-09"
  }
]
```

### Get Order Details

```http
GET /api/orders/{id}/
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 100,
  "order_number": "ORD-20260104-100",
  "items": [
    {
      "product": {
        "id": 1,
        "name": "Alpine Jacket Pro"
      },
      "quantity": 2,
      "price": "299.99"
    }
  ],
  "subtotal": "599.98",
  "status": "Delivered",
  "estimated_delivery": "2026-01-09",
  "created_at": "2026-01-04T10:30:00Z"
}
```

### Update Order Status (Admin Only)

```http
PATCH /api/admin/orders/{id}/
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "Shipped"
}
```

**Valid Statuses:**
- Order Placed
- Confirmed
- Packed
- Out for Delivery
- Delivered

**Response (200):**
```json
{
  "id": 100,
  "status": "Shipped"
}
```

---

## ⭐ Reviews

### List Product Reviews

```http
GET /api/products/{product_id}/reviews/
```

**Response (200):**
```json
[
  {
    "id": 1,
    "user": "John Doe",
    "rating": 5,
    "text": "Excellent product! Highly recommended.",
    "created_at": "2026-01-15T10:30:00Z"
  }
]
```

### Create Review

```http
POST /api/products/{product_id}/reviews/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "rating": 5,
  "text": "Amazing quality and fast shipping!"
}
```

**Response (201):**
```json
{
  "id": 2,
  "user": "You",
  "rating": 5,
  "text": "Amazing quality and fast shipping!",
  "created_at": "2026-01-20T15:45:00Z"
}
```

**Errors:**
- `404`: Product not found
- `400`: You have already reviewed this product
- `400`: Rating must be 1-5

---

## 👤 User Profile

### Get Profile

```http
GET /api/profile/
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe"
  },
  "profile": {
    "id": 1,
    "phone": "+1234567890",
    "avatar": "https://cdn.example.com/avatars/user1.jpg",
    "created_at": "2026-01-01T10:30:00Z"
  }
}
```

### Update Profile

```http
PATCH /api/profile/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "Johnny",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "first_name": "Johnny",
    "last_name": "Doe"
  },
  "profile": {
    "phone": "+1234567890"
  }
}
```

### Change Password

```http
POST /api/change-password/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "old_password": "OldPassword123!",
  "new_password": "NewPassword456!",
  "confirm_password": "NewPassword456!"
}
```

**Response (200):**
```json
{
  "detail": "Password updated successfully."
}
```

**Errors:**
- `400`: Old password is incorrect
- `400`: New passwords do not match
- `400`: Password is too weak

---

## 📝 Blog

### List Blog Posts

```http
GET /api/blog/
```

**Query Parameters:**
- `page` - Page number
- `search` - Search in title/content

**Response (200):**
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "title": "Mountain Climbing Guide",
      "content": "Complete guide to mountain climbing...",
      "author": "John Doe",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

### Create Blog Post (Authenticated User)

```http
POST /api/blog/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "My Adventure",
  "content": "Today I climbed a mountain..."
}
```

**Response (201):**
```json
{
  "id": 5,
  "title": "My Adventure",
  "content": "Today I climbed a mountain...",
  "author": "John Doe",
  "created_at": "2026-01-20T15:45:00Z"
}
```

### Delete Blog Post (Author or Admin)

```http
DELETE /api/blog/{id}/
Authorization: Bearer <access_token>
```

**Response (204):** No content

---

## 💬 Chat

### List Chat Sessions (Admin)

```http
GET /api/chat/sessions/
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "user": "John Doe",
    "created_at": "2026-01-15T10:30:00Z",
    "message_count": 5,
    "last_message_at": "2026-01-15T15:45:00Z"
  }
]
```

### Send Message (User)

```http
POST /api/chat/messages/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "text": "Hello, I need help with my order"
}
```

**Response (201):**
```json
{
  "id": 10,
  "text": "Hello, I need help with my order",
  "sender": "user",
  "created_at": "2026-01-20T15:45:00Z"
}
```

### Reply to Chat (Admin)

```http
POST /api/chat/sessions/{session_id}/reply/
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "text": "Hi! How can we assist you?"
}
```

**Response (201):**
```json
{
  "id": 11,
  "text": "Hi! How can we assist you?",
  "sender": "admin",
  "created_at": "2026-01-20T15:46:00Z"
}
```

---

## ❌ Error Handling

All errors follow this format:

```json
{
  "detail": "Error message explaining what went wrong",
  "code": "error_code_identifier"
}
```

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request succeeded, no response body |
| 400 | Bad Request - Invalid input or missing required fields |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Not permitted to access this resource |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal server error |

### Example Errors

**Invalid Credentials (401)**
```json
{
  "detail": "Invalid email or password",
  "code": "invalid_credentials"
}
```

**Product Not Found (404)**
```json
{
  "detail": "Product not found.",
  "code": "product_not_found"
}
```

**Cart Empty (400)**
```json
{
  "detail": "Cart is empty.",
  "code": "cart_empty"
}
```

---

## 🔑 Authentication Headers

All authenticated endpoints require:

```
Authorization: Bearer <access_token>
```

Example:
```http
GET /api/profile/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## 📊 Rate Limiting

*Currently not enforced. Enable before production.*

Recommended limits:
- Authentication endpoints: 5 requests per minute
- Product endpoints: 100 requests per minute
- Cart endpoints: 50 requests per minute

---

## 🔄 Pagination

List endpoints support pagination:

```http
GET /api/products/?page=2&page_size=20
```

**Response includes:**
```json
{
  "count": 150,
  "next": "http://api.example.com/products/?page=3",
  "previous": "http://api.example.com/products/?page=1",
  "results": [...]
}
```
