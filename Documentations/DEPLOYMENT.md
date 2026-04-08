# 🚀 Deployment Guide

This guide covers deploying Shikhar Outdoor to production environments.

## ⚠️ Prerequisites for Production

Before deploying, ensure:

- [ ] PostgreSQL 13+ instance created and running
- [ ] SECRET_KEY generated and secured
- [ ] All credentials in `.env` file (not in code)
- [ ] Tests passing locally
- [ ] Database migrations tested
- [ ] Static files collected
- [ ] SSL/TLS certificate obtained
- [ ] Domain name configured

---

## 📋 Production Deployment Checklist

### Security Requirements
- [ ] SECRET_KEY = strong random value
- [ ] DEBUG = False
- [ ] ALLOWED_HOSTS configured for your domain
- [ ] HTTPS enabled with valid SSL certificate
- [ ] SECURE_SSL_REDIRECT = True
- [ ] SESSION_COOKIE_SECURE = True
- [ ] CSRF_COOKIE_SECURE = True
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS configured for your domain only

### Database Requirements
- [ ] PostgreSQL deployed and accessible
- [ ] Database user created with strong password
- [ ] DATABASE_URL set correctly
- [ ] Automated backups configured
- [ ] Backup restoration tested
- [ ] All migrations applied
- [ ] Indexes created

### Application Requirements
- [ ] Python dependencies installed
- [ ] Frontend built and optimized
- [ ] Static files collected
- [ ] Media files directory configured
- [ ] Logging configured
- [ ] Error tracking (Sentry) configured
- [ ] Health check endpoint working

### Infrastructure Requirements
- [ ] Application server (Gunicorn) configured
- [ ] Reverse proxy (Nginx) configured
- [ ] Process manager (Supervisor/systemd) configured
- [ ] Monitoring and alerting configured
- [ ] Backup procedures documented
- [ ] Incident response plan created

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
# Build the image
docker build -t shikhar-outdoor:latest .

# Tag for registry
docker tag shikhar-outdoor:latest youregistry/shikhar-outdoor:latest

# Push to registry
docker push youregistry/shikhar-outdoor:latest
```

### Run with Docker Compose

```bash
# Create .env file
cp shikharOutdoor/.env.production .env

# Start services
docker-compose up -d

# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Collect static files
docker-compose exec web python manage.py collectstatic --noinput
```

### Production docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: shikhar-postgres
    environment:
      POSTGRES_DB: shikharoutdoor
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - shikhar-network

  redis:
    image: redis:7-alpine
    container_name: shikhar-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - shikhar-network

  web:
    build: .
    container_name: shikhar-web
    command: gunicorn shikharOutdoor.wsgi:application --bind 0.0.0.0:8000 --workers 4
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/shikharoutdoor
      DEBUG: "False"
      SECRET_KEY: ${SECRET_KEY}
      ALLOWED_HOSTS: ${ALLOWED_HOSTS}
      REDIS_URL: redis://redis:6379/0
    volumes:
      - ./media:/app/media
      - ./static:/app/static
      - ./logs:/app/logs
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - shikhar-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: shikhar-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./static:/app/static:ro
      - ./media:/app/media:ro
    depends_on:
      - web
    networks:
      - shikhar-network

volumes:
  postgres_data:
  redis_data:

networks:
  shikhar-network:
    driver: bridge
```

---

## 🌐 Nginx Configuration

Save as `nginx.conf`:

```nginx
upstream django {
    server web:8000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http/2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL configuration
    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Static files
    location /static/ {
        alias /app/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias /app/media/;
        expires 7d;
    }
    
    # API and application
    location / {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

---

## 🔑 Environment Setup

Create `.env.production`:

```env
DEBUG=False
SECRET_KEY=your-generated-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://postgres:strong_password@postgres:5432/shikharoutdoor

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=your-bucket-name

# Redis
REDIS_URL=redis://redis:6379/0

# Sentry
SENTRY_DSN=your-sentry-dsn

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**⚠️ IMPORTANT**: Never commit `.env` files to version control. Use GitHub Secrets or your platform's secrets management.

---

## 📊 Database Preparation

### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE shikharoutdoor;

# Create user
CREATE USER shikhar_user WITH PASSWORD 'strong_password';

# Grant privileges
ALTER ROLE shikhar_user SET client_encoding TO 'utf8';
ALTER ROLE shikhar_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE shikhar_user SET default_transaction_deferrable TO on;
ALTER ROLE shikhar_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE shikharoutdoor TO shikhar_user;
```

### Run Migrations

```bash
# Using Docker
docker-compose exec web python manage.py migrate

# Manual
cd shikharOutdoor
python manage.py migrate --settings=shikharOutdoor.settings
```

### Create Superuser

```bash
# Using Docker
docker-compose exec web python manage.py createsuperuser

# Manual
python manage.py createsuperuser
```

---

## 🔐 SSL/TLS Setup

### Using Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy to SSL directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/certificate.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/private.key

# Auto-renewal
sudo certbot renew --dry-run  # Test renewal
```

---

## 📈 Scaling Considerations

### Horizontal Scaling

```bash
# Scale web service
docker-compose up -d --scale web=3
```

### Load Balancing

Consider using:
- AWS Elastic Load Balancer (ELB)
- GCP Cloud Load Balancing
- HAProxy
- Nginx load balancing

### Cache Strategy

```python
# Redis caching in production
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

CACHE_TTL = 300  # 5 minutes
```

---

## 🔄 Backup & Recovery

### Automated Database Backups

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups"
DB_NAME="shikharoutdoor"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
```

### Restore from Backup

```bash
# Decompress
gunzip < backup.sql.gz | psql -U postgres shikharoutdoor

# Or with Docker
docker exec shikhar-postgres psql -U postgres shikharoutdoor < backup.sql
```

---

## 📊 Monitoring

### Health Check Endpoint

```python
# Add to urls.py
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'database': 'ok',
        'timestamp': datetime.now().isoformat()
    })

urlpatterns = [
    path('health/', health_check, name='health_check'),
]
```

### Logging Configuration

```python
# settings/production.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/app/logs/django.log',
            'maxBytes': 1024 * 1024 * 10,  # 10MB
            'backupCount': 10,
        },
        'sentry': {
            'level': 'ERROR',
            'class': 'sentry_sdk.integrations.logging.EventHandler',
        }
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'sentry'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

---

## 🚀 Deployment Process

### Step-by-Step Production Deployment

1. **Prepare environment**
   ```bash
   cp shikharOutdoor/.env.example .env.production
   # Edit .env.production with production values
   ```

2. **Build and test**
   ```bash
   docker-compose build
   docker-compose up
   # Test locally
   ```

3. **Push to registry**
   ```bash
   docker tag shikhar-outdoor:latest youregistry/shikhar-outdoor:latest
   docker push youregistry/shikhar-outdoor:latest
   ```

4. **Deploy on server**
   ```bash
   # SSH into server
   ssh user@production-server
   
   # Pull latest images
   docker-compose pull
   
   # Run migrations
   docker-compose exec web python manage.py migrate
   
   # Restart services
   docker-compose up -d
   
   # Verify
   curl https://yourdomain.com/health/
   ```

5. **Verify deployment**
   - Check health endpoint
   - Test login functionality
   - Verify API endpoints
   - Check error logs

---

## 🔄 Zero-Downtime Deployment

```bash
# Blue-Green deployment approach
docker-compose -f docker-compose.blue.yml up -d
# Run migrations on blue environment
docker-compose -f docker-compose.blue.yml exec web python manage.py migrate

# Switch traffic to blue (update Nginx upstream)
# Health check passes
# Remove old green environment
docker-compose -f docker-compose.green.yml down
```

---

## 📝 Post-Deployment

- [ ] Verify all services running: `docker-compose ps`
- [ ] Check logs: `docker-compose logs -f web`
- [ ] Test API endpoints
- [ ] Verify SSL certificate
- [ ] Test backup procedures
- [ ] Set up monitoring alerts
- [ ] Document deployment details

---

## 🆘 Troubleshooting Deployment

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues.

---

## 📞 Support

For deployment assistance, refer to:
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- [SECURITY.md](SECURITY.md)
- PostgreSQL Documentation
- Django Deployment Documentation
