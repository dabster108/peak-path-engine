# 👨‍💻 Development Guide

## Project Overview

**Shikhar Outdoor** is a full-stack e-commerce platform built with:
- **Frontend**: React 19 + Vite
- **Backend**: Django 6.0 + Django REST Framework
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Authentication**: JWT + Google OAuth 2.0
- **Deployment**: Docker, Gunicorn, Nginx

---

## Environment Setup

### Prerequisites
- Python 3.10+ (check with `python --version`)
- Node.js 18+ (check with `node --version`)
- Git
- PostgreSQL (for production setup)

### 1. Clone Repository
```bash
git clone <repository-url>
cd peak-path-engine
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
# Windows
python -m venv myapp
myapp\Scripts\activate

# macOS/Linux
python3 -m venv myapp
source myapp/bin/activate
```

#### Install Dependencies
```bash
cd shikharOutdoor
pip install -r requirements.txt
```

#### Configure Environment
```bash
# In shikharOutdoor folder
cp .env.example .env

# Edit .env with your values
nano .env  # or use any text editor

# Required variables:
# - SECRET_KEY (see SECURITY.md)
# - DEBUG=True (for development)
# - ALLOWED_HOSTS=localhost,127.0.0.1
# - GOOGLE_CLIENT_ID (from Google Console)
```

#### Initialize Database
```bash
python manage.py migrate
python manage.py createsuperuser  # Create admin user
python manage.py runserver  # Start development server
```

Server runs at: **http://localhost:8000**

### 3. Frontend Setup

#### Install Dependencies
```bash
# In root folder
npm install
```

#### Configure Environment
```bash
# Create .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:8000/api/
VITE_GOOGLE_CLIENT_ID=your-google-client-id
EOF
```

#### Start Development Server
```bash
npm run dev
```

App runs at: **http://localhost:5173**

---

## Development Workflow

### Starting the Project

#### Terminal 1: Backend
```bash
cd shikharOutdoor
# Activate venv first (Windows: myapp\Scripts\activate)
source ../myapp/bin/activate
python manage.py runserver
```

#### Terminal 2: Frontend
```bash
npm run dev
```

#### Terminal 3: (Optional) Logs
```bash
cd shikharOutdoor
tail -f debug.log  # Monitor Django logs
```

### Code Structure

```
project/
├── shikharOutdoor/          # Django backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3           # Development database
│   ├── shikharOutdoor/      # Main settings
│   │   ├── settings.py      # Configuration
│   │   ├── urls.py          # URL routing
│   │   └── wsgi.py          # Production entry point
│   └── shop/                # Main app
│       ├── models.py        # Database models
│       ├── views.py         # API endpoints
│       ├── serializers.py   # Data validation
│       ├── urls.py          # API routes
│       ├── admin.py         # Admin interface
│       └── migrations/      # Database migrations
│
├── src/                     # React frontend
│   ├── App.jsx              # Main component
│   ├── main.jsx             # Entry point
│   ├── components/          # Reusable components
│   ├── pages/               # Page components
│   ├── context/             # State management
│   ├── hooks/               # Custom hooks
│   ├── utils/               # Utility functions
│   │   ├── api.js           # Axios instance
│   │   └── errorHandler.js  # Error utilities
│   └── assets/              # Images, fonts
│
├── public/                  # Static files
├── package.json             # Frontend dependencies
├── vite.config.js           # Vite configuration
├── eslint.config.js         # Linting rules
└── .env                     # Environment variables (local only)
```

---

## API Development

### Adding a New Endpoint

#### 1. Create Model (if needed)
```python
# shikharOutdoor/shop/models.py

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('product', 'reviewer')
```

#### 2. Create Serializer
```python
# shikharOutdoor/shop/serializers.py

from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'product', 'reviewer', 'reviewer_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'reviewer', 'created_at']
```

#### 3. Create View
```python
# shikharOutdoor/shop/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

class ReviewView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, product_id):
        try:
            serializer = ReviewSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(reviewer=request.user, product_id=product_id)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)
```

#### 4. Add URL Route
```python
# shikharOutdoor/shop/urls.py

urlpatterns = [
    path('reviews/<int:product_id>/', ReviewView.as_view(), name='reviews'),
]
```

#### 5. Test Endpoint
```bash
# Using curl
curl -X POST http://localhost:8000/api/reviews/1/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Great product!"
  }'

# Or in Django shell
python manage.py shell
>>> from shop.models import Review, Product
>>> from django.contrib.auth.models import User
>>> user = User.objects.first()
>>> product = Product.objects.first()
>>> Review.objects.create(product=product, reviewer=user, rating=5, comment="Great!")
```

---

## Frontend Development

### Adding a New Page

#### 1. Create Component
```javascript
// src/pages/Reviews.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Reviews.css';

export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const { data } = await axios.get('/reviews/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="reviews">
            <h1>Customer Reviews</h1>
            {reviews.map(review => (
                <div key={review.id} className="review-card">
                    <h3>{review.reviewer_name}</h3>
                    <p>Rating: {review.rating}/5</p>
                    <p>{review.comment}</p>
                </div>
            ))}
        </div>
    );
}
```

#### 2. Add Route
```javascript
// src/App.jsx

import Reviews from './pages/Reviews';

// In router setup:
<Route path="/reviews" element={<Reviews />} />
```

#### 3. Add Navigation Link
```javascript
// src/components/Navbar.jsx

<Link to="/reviews">Reviews</Link>
```

---

## Common Development Tasks

### Running Tests

#### Backend Tests
```bash
cd shikharOutdoor

# Run all tests
python manage.py test

# Run specific app tests
python manage.py test shop

# Run specific test class
python manage.py test shop.tests.ProductTests

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report
```

#### Frontend Tests
```bash
# Run Vitest tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Linting & Formatting

#### Backend
```bash
# Check for issues
pip install flake8 pylint
flake8 shikharOutdoor/

# Auto-format
pip install black
black shikharOutdoor/

# Django checks
python manage.py check
```

#### Frontend
```bash
# Check
npm run lint

# Auto-fix
npm run lint --fix
# or
npm run lint -- --fix
```

### Database Management

#### Create Migration
```bash
# After changing models.py
cd shikharOutdoor
python manage.py makemigrations

# Review migration
cat shop/migrations/000X_xxx.py

# Apply migration
python manage.py migrate
```

#### Reset Database
```bash
# Remove all data and start fresh
cd shikharOutdoor
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### Building for Production

#### Backend
```bash
# Collect static files
cd shikharOutdoor
python manage.py collectstatic --noinput

# Create production settings
# Edit settings.py and set DEBUG=False
```

#### Frontend
```bash
# Build optimized bundle
npm run build

# Output in dist/ folder
# Ready to serve via web server
```

---

## Debugging

### Using Django Shell
```bash
python manage.py shell

# Test queries
>>> from shop.models import Product
>>> Product.objects.all()
>>> Product.objects.filter(name='Backpack').first()

# Test serializers
>>> from shop.serializers import ProductSerializer
>>> from shop.models import Product
>>> p = Product.objects.first()
>>> s = ProductSerializer(p)
>>> s.data

# Test authentication
>>> from django.contrib.auth.models import User
>>> u = User.objects.create_user(username='test', password='test123')
>>> from rest_framework.authtoken.models import Token
>>> Token.objects.create(user=u)
```

### Using Browser DevTools

#### Console Debugging
```javascript
// Check environment variables
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);

// Check tokens
console.log('Token:', localStorage.getItem('access_token'));

// Monitor API calls
// Network tab → check all requests/responses
```

#### React DevTools
```javascript
// Install React DevTools extension
// Inspect component state and props
```

### Logging

#### Backend Logging
```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'DEBUG',
    },
}

# In views
import logging
logger = logging.getLogger(__name__)
logger.debug('Debug message')
logger.error('Error message')
```

#### Frontend Logging
```javascript
// Create logger utility
export const logger = {
    debug: (msg) => console.log('[DEBUG]', msg),
    error: (msg) => console.error('[ERROR]', msg),
    warn: (msg) => console.warn('[WARN]', msg),
};

// Use globally
import { logger } from './utils/logger';
logger.error('Something went wrong!');
```

---

## Performance Tips

### Frontend
- Use React DevTools Profiler (measure render times)
- Code split routes with lazy loading
- Optimize images (use WebP format)
- Cache API responses

### Backend
- Use select_related() and prefetch_related()
- Add database indexes
- Cache frequently accessed data
- Use pagination for large datasets

---

## Git Workflow

### Branch Naming
```bash
feature/feature-name     # New features
hotfix/bug-name          # Bug fixes
refactor/component-name  # Code improvements
docs/update-readme       # Documentation
```

### Commit Conventions
```bash
git commit -m "feat: add product reviews endpoint"
git commit -m "fix: resolve CORS error for login"
git commit -m "docs: update API documentation"
git commit -m "style: format code with black"
```

### Creating Pull Request
```bash
# Create branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "feat: implement new feature"

# Push and create PR
git push origin feature/new-feature
```

---

## Useful Commands

### Django
```bash
cd shikharOutdoor

# Show all routes
python manage.py show_urls

# Create admin user
python manage.py createsuperuser

# Database shell
python manage.py dbshell

# Check system
python manage.py check

# Clear cache
python manage.py flush

# Export data
python manage.py dumpdata > data.json

# Import data
python manage.py loaddata data.json
```

### NPM
```bash
# Install single package
npm install package-name

# Update all packages
npm update

# Remove package
npm uninstall package-name

# Clear cache
npm cache clean --force

# List installed packages
npm list
```

---

## IDE Setup (VS Code)

### Extensions
1. **Python**: IntelliSense, linting, debugging
2. **Pylance**: Python type checking
3. **ES7+ React/Redux**: JavaScript snippets
4. **Thunder Client**: API testing
5. **SQLTools**: Database management
6. **GitLens**: Git integration

### Workspace Settings (`.vscode/settings.json`)
```json
{
    "python.defaultInterpreterPath": "${workspaceFolder}/myapp/bin/python",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "python.formatting.provider": "black",
    "[python]": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "ms-python.python"
    },
    "[javascript]": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
}
```

### Launch Configuration (`.vscode/launch.json`)
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Django",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/shikharOutdoor/manage.py",
            "args": ["runserver"],
            "django": true
        }
    ]
}
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find what's using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Use different port
python manage.py runserver 8001
```

### Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf myapp
python -m venv myapp
source myapp/bin/activate  # or myapp\Scripts\activate on Windows
pip install -r shikharOutdoor/requirements.txt
```

### CORS Errors
- Check `CORS_ALLOWED_ORIGINS` in Django settings
- Verify frontend .env has correct API URL
- Test with curl first to isolate frontend/backend issue

### Database Errors
- See [DATABASE.md](./DATABASE.md) for detailed troubleshooting

---

## Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

Last Updated: April 4, 2026
