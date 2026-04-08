# 🔧 Troubleshooting Guide

## Quick Diagnostics

### Django Server Issues

#### **ModuleNotFoundError: No module named 'X'**
```bash
# Check Python version
python --version  # Should be 3.10+

# Verify virtual environment is activated
which python  # On Windows: where python
# Should show path inside venv folder

# Install missing package
pip install [package-name]

# Reinstall all requirements
pip install -r requirements.txt

# If still failing, try:
pip install --upgrade pip setuptools wheel
rm -rf myapp/Lib/site-packages
pip install -r requirements.txt
```

**Common Missing Packages:**
- `dj-database-url`: `pip install dj-database-url==2.2.0`
- `python-dotenv`: `pip install python-dotenv`
- `google-auth`: `pip install google-auth google-auth-oauthlib`
- `django-cors-headers`: `pip install django-cors-headers`

---

#### **RuntimeError: Database query doesn't work on apps without migrations**
```bash
cd shikharOutdoor
python manage.py makemigrations
python manage.py migrate
```

---

#### **OperationalError: FATAL: remaining connection slots are reserved**
- PostgreSQL connection limit exceeded
- Solution: 
  ```bash
  # Check connections
  psql -U postgres -d shikharoutdoor -c "SELECT count(*) FROM pg_stat_activity;"
  
  # Kill idle connections
  psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state='idle';"
  ```

---

#### **ProgrammingError: relation doesn't exist**
```bash
# Database not initialized
cd shikharOutdoor
python manage.py migrate

# Or if using fresh PostgreSQL:
python manage.py migrate
python manage.py loaddata shop/fixtures/initial_data.json  # Load sample data if exists
```

---

#### **IntegrityError: duplicate key violates unique constraint**
- Trying to insert duplicate data
- Solution options:
  ```python
  # Option 1: Check if exists before insert
  obj, created = Model.objects.get_or_create(unique_field=value)
  
  # Option 2: Use update_or_create
  obj, created = Model.objects.update_or_create(
      unique_field=value,
      defaults={'field2': value2}
  )
  ```

---

#### **ConnectionError: Failed to establish a connection**
```bash
# Check Django settings
cd shikharOutdoor
python manage.py shell
>>> from django.conf import settings
>>> print(settings.DATABASES)
# Verify DATABASE_URL is correct

# Test database connection
python manage.py dbshell

# If PostgreSQL:
psql -h [host] -U [user] -d [database]
# Enter password when prompted
```

**Connection String Issues:**
```
WRONG: DATABASE_URL=postgres://user:pass@localhost/db
RIGHT: DATABASE_URL=postgresql://user:pass@localhost/db  # PostgreSQL 13+

# With port:
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

---

### Django Settings Issues

#### **ImproperlyConfigured: The SECRET_KEY setting must not be empty**
```python
# In settings.py or .env
SECRET_KEY = os.getenv('SECRET_KEY', 'your-fallback-key-here')

# Never commit actual SECRET_KEY
# In .env:
SECRET_KEY=your-actual-key-here
```

---

#### **ImproperlyConfigured: DEBUG must be False in production**
```python
# settings.py
DEBUG = os.getenv('DEBUG', 'False') == 'True'

# .env for development:
DEBUG=True

# .env for production:
DEBUG=False
```

---

#### **No module named '.env' or OSError: [Errno 2] No such file or directory: '.env'**
```bash
# .env should be in shikharOutdoor folder
ls -la shikharOutdoor/.env

# Create .env if missing
cd shikharOutdoor
cp .env.example .env
# Edit .env with your values
```

---

### API & Frontend Issues

#### **CORS Error: Access to XMLHttpRequest blocked**
```
Error: Access to XMLHttpRequest at 'http://localhost:8000/api/...'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**1. Check Django CORS settings
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# Or allow all (development only)
CORS_ALLOW_ALL_ORIGINS = True
```

2. Check frontend API URL
```javascript
// src/utils/api.js
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
// Should output: http://localhost:8000/api/
```

3. Test with curl
```bash
curl -X GET http://localhost:8000/api/products/
# Should work directly
```

---

#### **Failed to load resource: net::ERR_CONNECTION_REFUSED**
```
Django API not running or on wrong port
```

**Solution:**
```bash
# Terminal 1: Start Django
cd shikharOutdoor
python manage.py runserver

# Terminal 2: Check if running
curl http://localhost:8000/api/products/

# Terminal 3: Start React
npm run dev
```

**Check ports:**
```bash
# See what's running on port 8000
lsof -i :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows

# If occupied, use different port
python manage.py runserver 8001
```

---

#### **401 Unauthorized: Invalid token or missing Authorization header**
```javascript
// Expected header format:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Check token in frontend:
const token = localStorage.getItem('access_token');
console.log('Token:', token);
```

**Verify token is set after login:**
```bash
# In browser DevTools Console
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')
```

---

#### **500 Internal Server Error**
1. Check Django logs:
```bash
cd shikharOutdoor
python manage.py runserver

# Look for traceback in terminal output
```

2. Check file permissions:
```bash
# Ensure write permissions for media/logs
chmod -R 755 media/
```

3. Use shell to debug:
```bash
python manage.py shell
>>> from shop.models import Product
>>> Product.objects.all()
# If this fails, you've found the issue
```

---

#### **403 Forbidden: CSRF verification failed**
```bash
# Missing CSRF token or header
# Ensure frontend sends CSRF token:
```

```javascript
// For POST/PUT/DELETE requests
const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
// Or from cookie:
const csrfToken = getCookie('csrftoken');

axios.post('/api/endpoint/', data, {
    headers: { 'X-CSRFToken': csrfToken }
});
```

---

### React/Frontend Issues

#### **Module not found: Cannot find module 'X'**
```bash
npm install
# or
npm install [package-name]
```

---

#### **Failed to parse Source Map**
```bash
# Development only warning, safe to ignore
# If you want to fix it:
npm install --save-dev @sentry/vite-plugin
```

---

#### **Vite: Unable to resolve import**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

#### **Google OAuth Error: Invalid Client**
```
Error: Invalid client or client id
```

**Verify:**
1. Google Client ID is correct:
```javascript
// src/App.jsx
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

2. Check .env file:
```env
VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

3. Verify in Google Cloud Console:
   - New OAuth credentials
   - Redirect URIs registered
   - Include: `http://localhost:3000/`

---

#### **Console Error: Uncaught TypeError: Cannot read properties of undefined**
```bash
# 1. Check browser DevTools Console
# 2. Use debugger:
```

```javascript
// Add debugger statement
function handleClick() {
    debugger;  // Execution pauses here in DevTools
    console.log(variable);
}
```

---

### Performance Issues

#### **Slow API Response Times**
1. Check Django query count:
```python
# settings.py (development)
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

2. Use Django Debug Toolbar:
```bash
pip install django-debug-toolbar
```

```python
# settings.py
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
INTERNAL_IPS = ['127.0.0.1']
```

3. Optimize database queries:
```python
# Use select_related for ForeignKey
queryset = Product.objects.select_related('category')

# Use prefetch_related for ManyToMany/reverse ForeignKey
queryset = Product.objects.prefetch_related('reviews')

# Limit fields
queryset = Product.objects.only('id', 'name', 'price')
```

---

#### **Large Bundle Size**
```bash
# Analyze bundle
npm run build  # Creates dist/ folder
npx vite-plugin-visualizer  # Visualize bundle

# To reduce:
# 1. Remove unused packages
# 2. Lazy load routes:
```

```javascript
import { lazy, Suspense } from 'react';

const ProductDetails = lazy(() => import('./pages/ProductDetails'));

<Suspense fallback={<div>Loading...</div>}>
    <ProductDetails />
</Suspense>
```

---

### Deployment Issues

#### **Environment Variables Not Loaded**
```bash
# Check if .env exists
cat .env  # or type .env on Windows

# Check if loaded correctly:
python manage.py shell
>>> import os
>>> print(os.getenv('SECRET_KEY'))
# Should print value from .env
```

---

#### **Static Files Not Served**
```bash
# Collect static files
python manage.py collectstatic --noinput

# Check served folder
ls -la staticfiles/

# In production Nginx config:
location /static/ {
    alias /var/www/staticfiles/;
}
```

---

#### **Media Files Not Accessible**
```bash
# Check permissions
ls -la media/

# Ensure web server can read
sudo chown -R www-data:www-data media/
sudo chmod -R 755 media/

# In production Nginx config:
location /media/ {
    alias /var/www/media/;
}
```

---

### Database Issues

#### **PostgreSQL Connection Issues**
```bash
# Test connection
psql -h localhost -U shikhar -d shikharoutdoor

# If connection refused:
sudo systemctl start postgresql  # Linux
brew services start postgresql   # Mac
# Windows: Use Services app

# Check if running:
pg_isready
```

---

#### **SQLite Locked Error**
```
OperationalError: database is locked
```

```bash
# Only one process can write to SQLite
# Solution: Use PostgreSQL for production

# Temporary fix:
pkill -f manage.py  # Kill Django process
# Files will be deleted (not for production)
```

---

#### **"No such table" Error After Migration**
```bash
cd shikharOutdoor
python manage.py migrate --run-syncdb
```

---

### Logging & Debugging

#### **Enable Request/Response Logging**
```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'debug.log',
            'maxBytes': 1024 * 1024 * 15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'DEBUG',
    },
}
```

---

#### **Frontend Console Debugging**
```javascript
// Enable detailed logging
const setupLogging = () => {
    window.DEBUG = true;
    
    // Intercept all API calls
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        console.log('📤 Fetch:', args[0], args[1]);
        return originalFetch.apply(this, args)
            .then(res => {
                console.log('📥 Response:', res.status);
                return res;
            });
    };
};

setupLogging();
```

---

## Contact & Escalation

### Before Contacting Support
- ✅ Check this guide
- ✅ Check browser console (F12)
- ✅ Check Django console
- ✅ Check .env file
- ✅ Check database connection
- ✅ Search error message online

### Provide When Reporting Issues
1. Full error message and traceback
2. Steps to reproduce
3. Environment info:
   ```bash
   python --version
   pip list | grep -E 'django|djangorestframework|dj-database-url'
   node --version
   npm --version
   ```
4. Relevant log files (debug.log, error.log)
5. .env file (without secrets)

---

Last Updated: April 4, 2026
