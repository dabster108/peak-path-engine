# 🏗️ System Architecture

## System Overview

Shikhar Outdoor is a full-stack e-commerce application with the following architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │ React 19.2   │  │ React Router │  │ Context API    │   │
│  │ (Frontend)   │  │ (Navigation) │  │ (State Mgmt)   │   │
│  └──────────────┘  └──────────────┘  └────────────────┘   │
└─────────────┬───────────────────────────────────────────────┘
              │ HTTP/REST (Axios)
              │
┌─────────────▼───────────────────────────────────────────────┐
│              API Gateway & Load Balancer                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Nginx (Reverse Proxy, SSL/TLS, Load Balancing)      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────┬───────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────┐
│              Application Server Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Django 6.0 (Python Web Framework)                   │   │
│  │ ┌────────────────────────────────────────────────┐  │   │
│  │ │ Gunicorn WSGI Application Server (4 workers)  │  │   │
│  │ └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │ ┌──────────────────────────────────────────────┐   │   │
│  │ │ Django REST Framework (API)                 │   │   │
│  │ │ - Authentication (JWT)                      │   │   │
│  │ │ - Permissions & Authorization               │   │   │
│  │ │ - Serialization & Validation                │   │   │
│  │ └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │ ┌──────────────────────────────────────────────┐   │   │
│  │ │ Business Logic Layer                        │   │   │
│  │ │ - Views (ProductListView, CartView, etc.)  │   │   │
│  │ │ - Serializers (Data transformation)        │   │   │
│  │ │ - Models (ORM entities)                    │   │   │
│  │ └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└──┬──────────────────────────┬──────────────────┬──────┬──────┘
   │                          │                  │      │
   │ SQL/ORM                  │ Cache            │ File │
   │                          │ Operations       │ I/O  │
   │                          │                  │      │
┌──▼──────┐  ┌─────────┐  ┌──▼─────┐  ┌──────┐ │      │
│PostgreSQL   │ Redis   │  │Monitoring │ │S3/ │ │      │
│             │(Cache)  │  │ (Sentry)  │ │GCS │ │      │
│ - Users     │         │  │           │ │    │ │      │
│ - Products  │         │  │ - Errors  │ │    │ │      │
│ - Orders    │         │  │ - Metrics │ │    │ │      │
│ - Cart      │         │  │ - Logs    │ │    │ │      │
│ - Reviews   │         │  └───────────┘ └────┘ │      │
└─────────────┘ └─────────┘                      │      │
                                                  │      │
                           Static Assets ◄───────┴──────┘
                           (JS, CSS, Images)
```

---

## 📁 Directory Structure

```
peak-path-engine/
├── shikharOutdoor/              # Django Project
│   ├── manage.py                # Django CLI
│   ├── requirements.txt          # Python dependencies
│   ├── db.sqlite3               # Development database
│   ├── shikharOutdoor/          # Main project settings
│   │   ├── settings.py          # Django configuration
│   │   ├── urls.py              # URL routing
│   │   ├── wsgi.py              # WSGI application
│   │   └── asgi.py              # ASGI application
│   ├── shop/                    # Main app
│   │   ├── models.py            # Database models
│   │   ├── views.py             # API views
│   │   ├── serializers.py       # Data serializers
│   │   ├── urls.py              # App URL routing
│   │   ├── permissions.py       # Custom permissions
│   │   └── migrations/          # Database migrations
│   └── media/                   # User-uploaded files
│       ├── avatars/             # User avatars
│       └── products/            # Product images
│
├── src/                         # React Frontend
│   ├── main.jsx                 # React entry point
│   ├── App.jsx                  # Root component
│   ├── App.css                  # Global styles
│   ├── index.css                # Global stylesheet
│   ├── components/              # Reusable components
│   │   ├── Navbar.jsx           # Navigation
│   │   ├── Modal.jsx            # Modal dialog
│   │   ├── ProductCard.jsx      # Product card
│   │   ├── ChatModal.jsx        # Chat interface
│   │   └── Footer.jsx           # Footer
│   ├── pages/                   # Page components
│   │   ├── Home.jsx             # Home page
│   │   ├── Login.jsx            # Login page
│   │   ├── ProductDetails.jsx   # Product detail
│   │   ├── Admin.jsx            # Admin dashboard
│   │   ├── Checkout.jsx         # Cart/Checkout
│   │   └── Blog.jsx             # Blog page
│   ├── context/                 # State management
│   │   ├── UserContext.jsx      # User state
│   │   ├── CartContext.jsx      # Cart state
│   │   └── OrderContext.jsx     # Order state
│   ├── hooks/                   # Custom hooks
│   │   ├── useNavSections.js    # Navigation logic
│   │   └── useScrollAnimations.js
│   ├── utils/                   # Utilities
│   │   ├── api.js               # Axios instance
│   │   ├── errorHandler.js      # Error handling
│   │   ├── currency.js          # Currency formatting
│   │   └── productRoute.js      # Route mapping
│   └── assets/                  # Static assets
│
├── public/                      # Static files (served as-is)
├── dist/                        # Production build output
├── package.json                 # Node dependencies
├── vite.config.js              # Vite configuration
├── eslint.config.js            # ESLint configuration
├── .env                        # Environment variables
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── README.md                   # Project documentation
├── API.md                      # API documentation
├── DEPLOYMENT.md               # Deployment guide
├── ARCHITECTURE.md             # This file
├── SECURITY.md                 # Security hardening
├── DATABASE.md                 # Database schema
└── TROUBLESHOOTING.md          # Troubleshooting guide
```

---

## 🔄 Data Flow

### User Authentication Flow

```
1. User Registration
   ┌─────────────┐
   │ Frontend    │
   │ Register    │
   │ Form        │
   └──────┬──────┘
          │ POST /api/users/register/
          │ {email, password, name}
          ▼
   ┌──────────────┐
   │ Django       │
   │ RegisterView │
   └──────┬───────┘
          │ Validate data
          │ Hash password
          │ Create user
          ▼
   ┌──────────────┐
   │ PostgreSQL   │
   │ CustomUser   │
   │ Table        │
   └──────┬───────┘
          │ Return JWT tokens
          │
          ▼
   ┌─────────────┐
   │ Frontend    │
   │ localStorage│ ◄──── Store tokens
   └─────────────┘
```

### Product Purchase Flow

```
1. Product Browsing
   ┌─────────────┐
   │ User clicks │
   │ on product  │
   └──────┬──────┘
          │ GET /api/products/{id}/
          ▼
   ┌──────────────────┐
   │ Cache (Redis)    │ ◄──── Cache hit (fast)
   │ Check if cached  │
   └──────┬───────────┘
          │ Cache miss (slow path)
          ▼
   ┌──────────────┐
   │ PostgreSQL   │
   │ Query        │
   │ Products     │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Redis        │ ◄───── Cache result
   │ Store        │
   └──────┬───────┘
          │
          ▼
   ┌─────────────┐
   │ Frontend    │
   │ Display     │
   │ Product     │
   └─────────────┘

2. Add to Cart
   ┌──────────────┐
   │ User clicks  │
   │ "Add to Cart"│
   └──────┬───────┘
          │ POST /api/cart/items/
          ▼
   ┌──────────────┐
   │ CartContext  │ ◄──── Update local state
   │ updateCart() │
   └──────┬───────┘
          │ API call
          ▼
   ┌──────────────┐
   │ Django       │
   │ CartItemView │
   └──────┬───────┘
          │ Create/Update CartItem
          ▼
   ┌──────────────┐
   │ PostgreSQL   │
   │ CartItem     │
   │ Table        │
   └──────┬───────┘
          │ Return updated cart
          ▼
   ┌─────────────┐
   │ Frontend    │
   │ Show "Item  │
   │ Added"      │
   └─────────────┘

3. Checkout
   ┌──────────────┐
   │ User clicks  │
   │ "Checkout"   │
   └──────┬───────┘
          │ POST /api/orders/checkout/
          ▼
   ┌──────────────┐
   │ Django       │
   │ OrderView    │
   ├──────────────┤
   │ Validate     │
   │ Cart items   │
   │ Verify      │
   │ stock       │
   │ Create      │
   │ Order       │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ PostgreSQL   │
   │ Order        │
   │ OrderItem    │
   │ Tables       │
   └──────┬───────┘
          │ Clear cart
          │ Return order
          ▼
   ┌─────────────┐
   │ Frontend    │
   │ Show Order  │
   │ Confirmation│
   └─────────────┘
```

---

## 🗄️ Database Schema

### Core Entities

```
CustomUser (User Account)
├── id (PK)
├── email (unique)
├── username
├── password (hashed)
├── first_name
├── last_name
├── role (customer/admin)
├── is_staff
├── is_superuser
├── is_active
└── created_at

UserProfile (Additional User Info)
├── id (PK)
├── user_id (FK to CustomUser)
├── phone
├── avatar (image)
└── created_at

Category (Product Category)
├── id (PK)
├── name

Section (product Section within Category)
├── id (PK)
├── name
├── category_id (FK)

SubSection (Product SubSection)
├── id (PK)
├── name
├── section_id (FK)

Product (Catalog Item)
├── id (PK)
├── name
├── description
├── price (decimal)
├── original_price
├── stock (integer)
├── badge
├── category_id (FK)
├── section_id (FK)
├── sub_section_id (FK)
└── created_at

ProductImage (Product Photos)
├── id (PK)
├── product_id (FK)
├── image (file)
├── is_default (boolean)
└── created_at

Cart (Shopping Cart)
├── id (PK)
├── user_id (FK)
└── created_at

CartItem (Item in Cart)
├── id (PK)
├── cart_id (FK)
├── product_id (FK)
├── quantity
├── size
└── created_at

Order (Purchase Order)
├── id (PK)
├── order_number (unique)
├── user_id (FK)
├── subtotal (decimal)
├── status (order placed/delivered)
├── estimated_delivery
├── created_at
└── updated_at

OrderItem (Product in Order)
├── id (PK)
├── order_id (FK)
├── product_id (FK)
├── quantity
├── price_at_purchase
└── created_at

Review (Product Review)
├── id (PK)
├── product_id (FK)
├── user_id (FK)
├── rating (1-5)
├── text
└── created_at

BlogPost (User Blog Entry)
├── id (PK)
├── title
├── content
├── user_id (FK)
├── created_at
└── updated_at

ChatSession (User Chat)
├── id (PK)
├── user_id (FK)
├── created_at
└── updated_at

ChatMessage (Message in Chat)
├── id (PK)
├── session_id (FK)
├── sender (user/admin/bot)
├── text
├── read (boolean)
└── created_at
```

---

## 🔌 API Layers

### Request Flow

```
HTTP Request
    ↓
Nginx (Reverse Proxy)
    ↓
Gunicorn (WSGI Server)
    ↓
Django URL Router (urls.py)
    ↓
Middleware Stack
    ├─ CORS Middleware
    ├─ Authentication Middleware
    ├─ Session Middleware
    └─ CSRF Middleware
    ↓
View Function/Class
    ├─ Permission Check
    ├─ Parameter Validation
    ├─ Query Optimization
    └─ Business Logic
    ↓
Serializer (Validation & Transformation)
    ↓
Database Query (ORM)
    ↓
Cache (if applicable)
    ↓
Response Object
    ↓
Nginx (Response)
    ↓
Client
```

---

## 🔐 Authentication Architecture

### JWT Token Flow

```
1. Login
   ┌─────────┐
   │ Credentials │
   └────┬────┘
        │
        ▼
   ┌──────────────────┐
   │ Verify credentials│
   └────┬─────────────┘
        │
        ▼
   ┌────────────────────────┐
   │ Generate JWTs          │
   ├────────────────────────┤
   │ ACCESS (expires 1 day) │
   │ REFRESH (expires 7 day)│
   └────┬───────────────────┘
        │
        ▼
   ┌──────────────────┐
   │ Return tokens    │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────────┐
   │ Client stores        │
   │ tokens in localStorage
   └──────────────────────┘

2. Authenticated Request
   ┌────────────────────┐
   │ API Request        │
   │ + ACCESS token     │
   └────┬───────────────┘
        │
        ▼
   ┌──────────────────────┐
   │ Middleware verifies  │
   │ token signature      │
   │ token not expired    │
   └────┬─────────────────┘
        │ Valid
        ▼
   ┌──────────────────────┐
   │ Request processed    │
   └──────────────────────┘

3. Token Refresh
   ┌──────────────────────┐
   │ ACCESS token expired │
   └────┬─────────────────┘
        │
        ▼
   ┌──────────────────────┐
   │ POST /api/refresh/   │
   │ + REFRESH token      │
   └────┬─────────────────┘
        │
        ▼
   ┌──────────────────────┐
   │ Verify refresh token │
   │ Issue new ACCESS     │
   └────┬─────────────────┘
        │
        ▼
   ┌──────────────────────┐
   │ Return new ACCESS    │
   │ token                │
   └──────────────────────┘
```

---

## 📊 State Management (Frontend)

### React Context Structure

```
App.jsx
├─ UserContext Provider
│  ├─ user (current user data)
│  ├─ isAdmin (boolean)
│  ├─ setUser()
│  ├─ clearUser()
│  └─ fetchUser()
│
├─ CartContext Provider
│  ├─ items (cart items)
│  ├─ total (subtotal)
│  ├─ count (item count)
│  ├─ addItem()
│  ├─ removeItem()
│  ├─ updateQuantity()
│  └─ clearCart()
│
└─ OrderContext Provider
   ├─ orders (user's orders)
   ├─ createOrder()
   ├─ fetchOrders()
   └─ updateOrderStatus() (admin)
```

---

## 🔄 Caching Strategy

### Redis Cache Layers

```
Level 1: HTTP Client Cache
├─ Browser cache (CSS, JS, images)
├─ Service worker cache
└─ HTTP cache headers

Level 2: API Response Cache (Redis)
├─ Product list (30 minutes TTL)
├─ Product details (1 hour TTL)
├─ Category list (1 hour TTL)
└─ User profile (5 minutes TTL)

Level 3: Database Query Cache
├─ Used by ORM
├─ select_related() optimization
└─ prefetch_related() optimization

Invalidation:
├─ Time-based expiration
├─ Manual on update (product edited)
├─ Event-based (order placed)
└─ Cache busting on deployment
```

---

## 🚀 Performance Optimization

### Database Optimizations
- Indexes on frequently queried fields
- select_related() for foreign keys
- prefetch_related() for reverse FKs
- Pagination for large result sets

### Frontend Optimizations
- Code splitting by route
- Lazy loading of images
- CSS minification
- JavaScript minification
- Gzip compression

### API Optimizations
- Pagination (20 items default)
- Field filtering
- Response caching
- Query result limiting

---

## 📐 Deployment Topology

### Production Stack

```
┌─────────────────────────────────────┐
│ CDN (Static Assets)                │
│ - CSS, JS, Images                  │
└─────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│ Load Balancer (AWS ELB/ GCP LB)    │
│ - SSL/TLS termination              │
│ - Health checks                    │
│ - Traffic distribution             │
└──────────┬──────────────────────────┘
           │
      ┌────┴────┬────────┬────────┐
      ▼         ▼        ▼        ▼
┌──────────────────────────────────────────┐
│ Server 1   │ Server 2   │ Server 3   │
├──────────┬──────────┬──────────┬──────────┤
│Nginx     │ Nginx    │ Nginx    │ Nginx    │
├──────────┼──────────┼──────────┼──────────┤
│Gunicorn  │Gunicorn  │Gunicorn  │Gunicorn  │
│(4 workers)
└──────────┴──────────┴──────────┴──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ PostgreSQL Database                 │
│ - Primary (Read/Write)              │
│ - Replicas (Read-only)              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Redis Cache Cluster                 │
│ - Session storage                   │
│ - Query caching                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Monitoring & Logging                │
│ - Sentry (Error tracking)           │
│ - ELK/Datadog (Logs)                │
│ - Prometheus (Metrics)              │
└─────────────────────────────────────┘
```

---

## 🔄 CI/CD Pipeline

```
Source Code
    ↓
1. Test Stage
   ├─ Unit tests
   ├─ Integration tests
   ├─ Linting (ESLint, Black)
   └─ Security scanning
    ↓ (Pass/Fail)
2. Build Stage
   ├─ Build frontend (npm run build)
   ├─ Build Docker image
   └─ Push to registry
    ↓
3. Deploy to Staging
   ├─ Pull latest image
   ├─ Run migrations
   ├─ Health checks
   └─ Smoke tests
    ↓ (Pass/Fail)
4. Manual Approval
    ↓
5. Deploy to Production
   ├─ Blue-Green deployment
   ├─ Run health checks
   ├─ Verify health
   └─ Activate new version
    ↓
6. Monitor
   ├─ Error rate
   ├─ Response time
   ├─ CPU/Memory
   └─ Alert on anomalies
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────┐
│ Client (Browser)                        │
│ - HTTPS only                            │
│ - Content Security Policy               │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ Network Layer                           │
│ - DDoS protection                       │
│ - WAF (Web Application Firewall)        │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ Application Layer                       │
│ ├─ CSRF protection                      │
│ ├─ Input validation                     │
│ ├─ Rate limiting                        │
│ └─ Authentication/Authorization         │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│ Database Layer                          │
│ ├─ Parameterized queries (ORM)          │
│ ├─ Encrypted passwords                  │
│ ├─ Row-level security                   │
│ └─ Audit logging                        │
└─────────────────────────────────────────┘
```

---

## 📈 Scaling Strategy

### Horizontal Scaling
- Add more application servers behind load balancer
- Database read replicas
- Redis cluster nodes

### Vertical Scaling
- Increase server CPU/RAM
- Optimize slow queries
- Increase database IOPS

### Caching Strategy
- Redis for session/query cache
- CDN for static assets
- HTTP cache headers

---

For more details, see:
- [API.md](API.md) - API endpoint documentation
- [DATABASE.md](DATABASE.md) - Database schema
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment procedures
- [SECURITY.md](SECURITY.md) - Security hardening
