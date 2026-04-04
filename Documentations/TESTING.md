# 🧪 Testing Guide

## Testing Overview

**Current Status**: 0/0 tests implemented (0% coverage)
**Target**: 80%+ coverage for production

### Testing Pyramid
```
               /\
              /  \ - Integration Tests (10%)
             /----\
            /      \
           /   UI   \  - UI Tests (30%)
          /----------\
         /            \
        /    Unit      \ - Unit Tests (60%)
       /----------------\
```

---

## Setup

### Install Testing Dependencies

#### Backend
```bash
cd shikharOutdoor
pip install pytest==7.4.0 pytest-django==4.7.0 factory-boy==3.3.0 faker==20.0.0

# Add to requirements.txt
echo "
pytest==7.4.0
pytest-django==4.7.0
factory-boy==3.3.0
faker==20.0.0" >> requirements.txt
```

#### Frontend
```bash
npm install -D vitest@1.0.0 @testing-library/react@14.0.0 @testing-library/jest-dom@6.1.4 jsdom@23.0.0
```

### Configure Pytest

#### Create `pytest.ini`
```ini
[pytest]
DJANGO_SETTINGS_MODULE = shikharOutdoor.settings
python_files = tests.py test_*.py *_tests.py
testpaths = shop/tests
addopts = --cov=shop --cov-report=html --cov-report=term
```

#### Create `conftest.py` (Backend)
```python
# shikharOutdoor/conftest.py

import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shikharOutdoor.settings')
django.setup()

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    """Provides APIClient for tests"""
    return APIClient()

@pytest.fixture
def authenticated_client(api_client):
    """Provides authenticated APIClient"""
    user = User.objects.create_user(username='testuser', password='testpass123')
    api_client.force_authenticate(user=user)
    return api_client

@pytest.fixture
def test_user():
    """Creates a test user"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )

@pytest.fixture
def test_product(db):
    """Creates a test product"""
    from shop.models import Product, Category
    category = Category.objects.create(name='Test Category')
    return Product.objects.create(
        name='Test Product',
        category=category,
        price=99.99,
        stock=10
    )
```

### Configure Vitest (Frontend)

#### Create `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
```

#### Create `src/test/setup.ts`
```typescript
import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any
```

---

## Backend Testing

### Unit Tests

#### Test Models
```python
# shikharOutdoor/shop/tests/test_models.py

import pytest
from django.contrib.auth.models import User
from shop.models import Product, Category, Review

@pytest.mark.django_db
class TestProductModel:
    """Test Product model"""
    
    def test_create_product(self):
        """Test creating a product"""
        category = Category.objects.create(name='Backpacks')
        product = Product.objects.create(
            name='Test Backpack',
            category=category,
            price=149.99,
            stock=10
        )
        
        assert product.id is not None
        assert product.name == 'Test Backpack'
        assert product.price == 149.99
        assert product.stock == 10
    
    def test_product_str(self):
        """Test product string representation"""
        category = Category.objects.create(name='Gear')
        product = Product.objects.create(
            name='Hiking Gear',
            category=category,
            price=199.99
        )
        
        assert str(product) == 'Hiking Gear'
    
    def test_total_stock_value(self):
        """Test total stock value calculation"""
        category = Category.objects.create(name='Equipment')
        product = Product.objects.create(
            name='Equipment',
            category=category,
            price=100.0,
            stock=5
        )
        
        assert product.price * product.stock == 500.0
```

#### Test Serializers
```python
# shikharOutdoor/shop/tests/test_serializers.py

import pytest
from shop.models import Product, Category
from shop.serializers import ProductSerializer

@pytest.mark.django_db
class TestProductSerializer:
    """Test ProductSerializer"""
    
    def test_serialize_product(self):
        """Test serializing product"""
        category = Category.objects.create(name='Gear')
        product = Product.objects.create(
            name='Test Product',
            category=category,
            price=99.99,
            stock=5
        )
        
        serializer = ProductSerializer(product)
        data = serializer.data
        
        assert data['name'] == 'Test Product'
        assert float(data['price']) == 99.99
        assert data['stock'] == 5
    
    def test_deserialize_product(self):
        """Test deserializing product"""
        category = Category.objects.create(name='Gear')
        data = {
            'name': 'New Product',
            'category': category.id,
            'price': 149.99,
            'stock': 10
        }
        
        serializer = ProductSerializer(data=data)
        assert serializer.is_valid()
        product = serializer.save()
        
        assert product.name == 'New Product'
        assert product.price == 149.99
```

### API/Integration Tests

#### Test Views
```python
# shikharOutdoor/shop/tests/test_views.py

import pytest
from django.urls import reverse
from rest_framework import status

@pytest.mark.django_db
class TestProductAPI:
    """Test Product API endpoints"""
    
    def test_get_products(self, api_client):
        """Test GET /api/products/"""
        url = reverse('product-list')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
    
    def test_create_product_unauthorized(self, api_client):
        """Test creating product without authentication"""
        url = reverse('product-list')
        data = {'name': 'Test', 'price': 99.99}
        
        response = api_client.post(url, data)
        
        # Should be unauthorized (needs authentication)
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN
        ]
    
    def test_create_product_authenticated(self, authenticated_client):
        """Test creating product with authentication"""
        url = reverse('product-list')
        data = {
            'name': 'New Product',
            'category': 1,
            'price': 199.99,
            'stock': 5
        }
        
        response = authenticated_client.post(url, data)
        
        assert response.status_code == status.HTTP_201_CREATED
    
    def test_update_product(self, authenticated_client, test_product):
        """Test updating product"""
        url = reverse('product-detail', args=[test_product.id])
        data = {'name': 'Updated Product'}
        
        response = authenticated_client.patch(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Product'
    
    def test_delete_product(self, authenticated_client, test_product):
        """Test deleting product"""
        url = reverse('product-detail', args=[test_product.id])
        
        response = authenticated_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
```

#### Test Authentication
```python
# shikharOutdoor/shop/tests/test_auth.py

import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User

@pytest.mark.django_db
class TestAuthentication:
    """Test JWT authentication"""
    
    def test_login(self, api_client):
        """Test user login"""
        User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        url = reverse('token_obtain_pair')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
    
    def test_invalid_credentials(self, api_client):
        """Test login with invalid credentials"""
        User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        url = reverse('token_obtain_pair')
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_token_refresh(self, authenticated_client):
        """Test refreshing JWT token"""
        url = reverse('token_refresh')
        # Get refresh token first
        # ...implementation
        
        response = authenticated_client.post(url, {'refresh': 'token'})
        
        assert response.status_code == status.HTTP_200_OK
```

### Run Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest shop/tests/test_models.py

# Run specific test class
pytest shop/tests/test_models.py::TestProductModel

# Run specific test
pytest shop/tests/test_models.py::TestProductModel::test_create_product

# Run with coverage
pytest --cov=shop --cov-report=html

# Show coverage report
coverage report -m
```

---

## Frontend Testing

### Unit Tests (Components)

#### Test Component
```javascript
// src/components/__tests__/ProductCard.test.jsx

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProductCard from '../ProductCard'

describe('ProductCard', () => {
    const mockProduct = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        image_url: '/test.jpg',
        stock: 5
    }
    
    it('renders product name', () => {
        render(<ProductCard product={mockProduct} />)
        expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
    
    it('renders product price', () => {
        render(<ProductCard product={mockProduct} />)
        expect(screen.getByText('$99.99')).toBeInTheDocument()
    })
    
    it('renders add to cart button', () => {
        render(<ProductCard product={mockProduct} />)
        const button = screen.getByRole('button', { name: /add to cart/i })
        expect(button).toBeInTheDocument()
    })
    
    it('shows out of stock for zero stock', () => {
        const outOfStock = { ...mockProduct, stock: 0 }
        render(<ProductCard product={outOfStock} />)
        expect(screen.getByText('Out of Stock')).toBeInTheDocument()
    })
})
```

#### Test Hooks
```javascript
// src/hooks/__tests__/useCart.test.js

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useCart from '../useCart'

describe('useCart', () => {
    beforeEach(() => {
        localStorage.clear()
    })
    
    it('initializes with empty cart', () => {
        const { result } = renderHook(() => useCart())
        expect(result.current.items).toEqual([])
    })
    
    it('adds item to cart', () => {
        const { result } = renderHook(() => useCart())
        
        act(() => {
            result.current.addItem({ id: 1, price: 50 })
        })
        
        expect(result.current.items).toHaveLength(1)
        expect(result.current.items[0].id).toBe(1)
    })
    
    it('calculates total correctly', () => {
        const { result } = renderHook(() => useCart())
        
        act(() => {
            result.current.addItem({ id: 1, price: 50 })
            result.current.addItem({ id: 2, price: 30 })
        })
        
        expect(result.current.total).toBe(80)
    })
})
```

#### Test Utilities
```javascript
// src/utils/__tests__/errorHandler.test.js

import { describe, it, expect } from 'vitest'
import { getErrorMessage } from '../errorHandler'

describe('errorHandler', () => {
    it('extracts message from response error', () => {
        const error = {
            response: {
                data: { detail: 'Product not found' }
            }
        }
        
        const message = getErrorMessage(error)
        expect(message).toBe('Product not found')
    })
    
    it('returns fallback message if no error', () => {
        const message = getErrorMessage(null)
        expect(message).toBe('Something went wrong...')
    })
    
    it('handles string error response', () => {
        const error = {
            response: {
                data: 'Unexpected error'
            }
        }
        
        const message = getErrorMessage(error)
        expect(message).toBe('Unexpected error')
    })
})
```

### Integration Tests (Pages)

```javascript
// src/pages/__tests__/ProductDetails.test.jsx

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductDetails from '../ProductDetails'
import * as api from '../../utils/api'

vi.mock('../../utils/api')

describe('ProductDetails Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })
    
    it('loads and displays product', async () => {
        const mockProduct = {
            id: 1,
            name: 'Test Product',
            price: 99.99,
            description: 'Test description'
        }
        
        api.get.mockResolvedValueOnce({ data: mockProduct })
        
        render(<ProductDetails />)
        
        await waitFor(() => {
            expect(screen.getByText('Test Product')).toBeInTheDocument()
        })
    })
    
    it('adds product to cart', async () => {
        const user = userEvent.setup()
        const mockProduct = {
            id: 1,
            name: 'Test Product',
            price: 99.99
        }
        
        api.get.mockResolvedValueOnce({ data: mockProduct })
        
        render(<ProductDetails />)
        
        await waitFor(() => {
            expect(screen.getByText('Test Product')).toBeInTheDocument()
        })
        
        const addButton = screen.getByRole('button', { name: /add to cart/i })
        await user.click(addButton)
        
        expect(screen.getByText('Added to cart')).toBeInTheDocument()
    })
})
```

### Run Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- src/components/__tests__/ProductCard.test.jsx

# Generate coverage report
npm run test:coverage
```

---

## Coverage Goals

### Backend
```
Target: 80%+ coverage

Priority breakdown:
- Models: 95% (critical)
- Serializers: 90% (critical)
- Views: 85% (important)
- Utils: 80% (important)
```

### Frontend
```
Target: 75%+ coverage

Priority breakdown:
- Components: 80% (critical)
- Hooks: 85% (critical)
- Utils: 90% (critical)
- Pages: 70% (important)
```

---

## Test Data Factories

### Backend Factories
```python
# shikharOutdoor/shop/tests/factories.py

import factory
from factory.django import DjangoModelFactory
from faker import Faker
from django.contrib.auth.models import User
from shop.models import Product, Category, Review

fake = Faker()

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
    
    username = factory.Sequence(lambda n: f'testuser{n}')
    email = factory.LazyAttribute(lambda o: f'{o.username}@example.com')
    first_name = faker.first_name()
    last_name = faker.last_name()
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')

class CategoryFactory(DjangoModelFactory):
    class Meta:
        model = Category
    
    name = factory.LazyAttribute(lambda o: fake.word())

class ProductFactory(DjangoModelFactory):
    class Meta:
        model = Product
    
    name = factory.LazyAttribute(lambda o: fake.words(nb=3, ext_word_list=None))
    category = factory.SubFactory(CategoryFactory)
    price = factory.LazyAttribute(lambda o: fake.pydecimal(left_digits=4, right_digits=2, positive=True))
    stock = factory.LazyAttribute(lambda o: fake.random_int(min=1, max=1000))
    description = factory.LazyAttribute(lambda o: fake.text())
```

### Usage
```python
@pytest.mark.django_db
def test_with_factories():
    user = UserFactory()
    product = ProductFactory()
    review = ReviewFactory(reviewer=user, product=product)
    
    assert review.reviewer.username == user.username
```

---

## CI/CD Pipeline Testing

### GitHub Actions (`.github/workflows/tests.yml`)
```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd shikharOutdoor
          pip install -r requirements.txt
      
      - name: Run tests
        run: |
          cd shikharOutdoor
          pytest --cov=shop --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./shikharOutdoor/coverage.xml

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Best Practices

✅ **DO:**
- Keep tests focused and small
- Use descriptive test names
- Test behavior, not implementation
- Use fixtures for shared data
- Test error cases
- Mock external dependencies
- Maintain 80%+ coverage

❌ **DON'T:**
- Write implementation details as tests
- Test third-party libraries
- Create tests that depend on each other
- Ignore test failures
- Skip tests in CI/CD
- Mock Django internals

---

## Testing Checklist

### Before Release
- [ ] All tests passing
- [ ] Coverage > 80%
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security tests passing
- [ ] Load tests passing

---

Last Updated: April 4, 2026
