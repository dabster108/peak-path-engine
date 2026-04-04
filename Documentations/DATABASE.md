# 🗄️ Database Management Guide

## Database Architecture Overview

### Current Setup
- **Development**: SQLite (local file database)
- **Production**: PostgreSQL (recommended)
- **ORM**: Django ORM with relationships

```
┌─────────────────────────────────────┐
│     Django Application              │
├─────────────────────────────────────┤
│  Models (shop/models.py)            │
│  - User, Product, Review            │
│  - Cart, Order, OrderItem           │
│  - Blog, Chat, AdminChatReply       │
├─────────────────────────────────────┤
│  ORM Layer (Django ORM)             │
├─────────────────────────────────────┤
│  Database Connection                │
│  (PostgreSQL / SQLite)              │
├─────────────────────────────────────┤
│  Database Server                    │
└─────────────────────────────────────┘
```

---

## SQLite (Development)

### When to Use
- ✅ Local development
- ✅ Testing
- ✅ Single-user scenarios
- ❌ Production
- ❌ Multiple concurrent users

### Setup
```bash
# Already initialized
# Location: shikharOutdoor/db.sqlite3

# To reset (clear all data):
rm shikharOutdoor/db.sqlite3
cd shikharOutdoor
python manage.py migrate
```

### Limitations
- No concurrent writes
- File-based (not suitable for servers)
- Limited data types
- No full-text search
- No replication

---

## PostgreSQL (Production)

### Installation

#### macOS
```bash
brew install postgresql@15

# Start service
brew services start postgresql@15

# Verify
psql --version
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgresql-15-dev

# Start service
sudo systemctl start postgresql

# Verify
psql --version
```

#### Windows
```bash
# Download installer: https://www.postgresql.org/download/windows/
# Run installer, remember postgres password
# Add to PATH

# Verify
psql --version
```

#### Docker (Recommended)
```bash
docker run --name postgres \
  -e POSTGRES_DB=shikharoutdoor \
  -e POSTGRES_USER=shikhar \
  -e POSTGRES_PASSWORD=your_strong_password \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -d postgres:15
```

---

### Initial Configuration

#### 1. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql shell:
CREATE DATABASE shikharoutdoor;

# Grant access
CREATE USER shikhar WITH PASSWORD 'your_strong_password';
ALTER ROLE shikhar SET client_encoding TO 'utf8';
ALTER ROLE shikhar SET default_transaction_isolation TO 'read committed';
ALTER ROLE shikhar SET default_transaction_deferrable TO on;
ALTER ROLE shikhar SET timezone TO 'UTC';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE shikharoutdoor TO shikhar;

# Verify
\l
```

#### 2. Update Django Settings
```bash
# Install adapter
pip install psycopg2-binary==2.9.10

# Update requirements.txt
echo "psycopg2-binary==2.9.10" >> shikharOutdoor/requirements.txt

# Update settings.py
```

```python
# shikharOutdoor/settings.py
import dj_database_url
from decouple import config

DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv(
            'DATABASE_URL',
            'postgresql://shikhar:password@localhost:5432/shikharoutdoor'
        ),
        conn_max_age=600,
        conn_health_checks=True,
    )
}
```

#### 3. Set Environment Variable
```bash
# shikharOutdoor/.env
DATABASE_URL=postgresql://shikhar:your_strong_password@localhost:5432/shikharoutdoor
```

#### 4. Run Migrations
```bash
cd shikharOutdoor

# Create all tables
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load sample data (if fixtures exist)
python manage.py loaddata shop/fixtures/initial_data.json
```

---

### Connection Pooling

For production, use connection pooling to handle multiple concurrent connections efficiently.

#### PgBouncer Setup
```bash
# Install on Ubuntu
sudo apt install pgbouncer

# Configuration: /etc/pgbouncer/pgbouncer.ini
```

```ini
[databases]
shikharoutdoor = host=localhost port=5432 dbname=shikharoutdoor user=shikhar password=your_password

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 10
reserve_pool_size = 5
reserve_pool_timeout = 3
max_idle_connections = 600
```

---

### Monitoring

#### Check Connections
```sql
-- Active connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

-- Detailed connections
SELECT pid, usename, application_name, state FROM pg_stat_activity;

-- Kill hanging connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE datname='shikharoutdoor' AND state='idle' AND query_start < now() - interval '10 minutes';
```

#### Database Size
```sql
-- Total size
SELECT pg_size_pretty(pg_database_size('shikharoutdoor'));

-- Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname != 'pg_catalog' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Slow Queries
```sql
-- Enable query logging
ALTER DATABASE shikharoutdoor SET log_min_duration_statement = 1000;  -- 1 second

-- View slow queries
SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

-- Extension required:
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

---

## Data Models

### Core Tables

#### Users
```
users/
├── id (PrimaryKey)
├── username (Unique)
├── email (Unique)
├── password_hash
├── first_name
├── last_name
├── is_active
├── is_superuser
├── created_at
└── updated_at
```

#### Products
```
products/
├── id (PrimaryKey)
├── name
├── category (ForeignKey → Category)
├── price (Decimal)
├── stock (Integer)
├── description
├── image_url
├── created_by (ForeignKey → User)
├── created_at
└── updated_at
```

#### Orders
```
orders/
├── id (PrimaryKey)
├── customer (ForeignKey → User)
├── total_price (Decimal)
├── status (Choice: pending, confirmed, shipped, delivered)
├── created_at
└── updated_at

order_items/
├── id (PrimaryKey)
├── order (ForeignKey → Order)
├── product (ForeignKey → Product)
├── quantity
├── price
└── created_at
```

#### Reviews
```
reviews/
├── id (PrimaryKey)
├── product (ForeignKey → Product)
├── reviewer (ForeignKey → User)
├── rating (1-5)
├── comment (Text)
├── created_at
└── updated_at
```

---

## Migrations

### Creating Migrations

#### When You Change Models
```bash
cd shikharOutdoor

# 1. Modify models.py
# 2. Create migration file
python manage.py makemigrations

# 3. Review migration (shows SQL)
cat shop/migrations/000X_xxx.py

# 4. Apply migration
python manage.py migrate

# 5. Test everything works
python manage.py test
```

### Migration Best Practices

```python
# Good: Add nullable field first, then populate, then make required
# Step 1:
class Migration(migrations.Migration):
    operations = [
        migrations.AddField(
            model_name='product',
            name='new_field',
            field=models.CharField(null=True, max_length=100),
        ),
    ]

# Step 2: Populate via data migration
def populate_field(apps, schema_editor):
    Product = apps.get_model('shop', 'Product')
    for product in Product.objects.all():
        product.new_field = 'default_value'
        product.save()

class Migration(migrations.Migration):
    operations = [
        migrations.RunPython(populate_field),
    ]

# Step 3:
class Migration(migrations.Migration):
    operations = [
        migrations.AlterField(
            model_name='product',
            name='new_field',
            field=models.CharField(max_length=100),
        ),
    ]
```

### Reverting Migrations
```bash
# Show migration history
python manage.py showmigrations

# Revert to specific migration
python manage.py migrate shop 0005

# Revert all migrations in app
python manage.py migrate shop zero

# Rollback one migration
python manage.py migrate shop 0004
```

---

## Backups & Recovery

### SQLite Backup
```bash
# Simple file copy
cp shikharOutdoor/db.sqlite3 db.sqlite3.backup

# Automated daily backup
# Add to crontab:
# 0 2 * * * cp /path/to/db.sqlite3 /backups/db.sqlite3.$(date +\%Y\%m\%d)
```

### PostgreSQL Backup

#### Full Backup
```bash
# Plain text format
pg_dump -U shikhar -h localhost shikharoutdoor > backup.sql

# Compressed format (recommended)
pg_dump -U shikhar -h localhost -F c shikharoutdoor > backup.dump

# With backup location
pg_dump -U shikhar -h localhost shikharoutdoor > /backups/db_$(date +%Y%m%d).sql

# Encrypted backup
pg_dump -U shikhar -h localhost shikharoutdoor | openssl enc -aes-256-cbc -out backup.sql.enc
```

#### Incremental Backup (PITR)
```bash
# Enable WAL archiving in postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'

# Backup WAL files separately
# Combined with full backups for point-in-time recovery
```

#### Automated Backups (Docker)
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/postgres"
RETENTION_DAYS=30

# Create backup
docker exec postgres pg_dump -U shikhar shikharoutdoor | gzip > $BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sql.gz

# Remove old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR s3://bucket-backups/ --recursive
```

### PostgreSQL Restore

#### Full Restore
```bash
# Plain text format
psql -U shikhar -h localhost shikharoutdoor < backup.sql

# Compressed format
pg_restore -U shikhar -h localhost -d shikharoutdoor backup.dump

# Encrypted backup
openssl enc -d -aes-256-cbc -in backup.sql.enc | psql -U shikhar -h localhost shikharoutdoor
```

#### Restore to Point in Time
```bash
# Requires WAL archiving enabled
# Recovery method:
# 1. Stop PostgreSQL
# 2. Copy backup + WAL archives
# 3. Set recovery parameters
# 4. Start PostgreSQL
```

---

## Performance Optimization

### Indexing

#### Check Missing Indexes
```sql
-- Find queries that should use indexes
SELECT schemaname, tablename, indexname FROM pg_indexes WHERE schemaname = 'public';

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan FROM pg_stat_user_indexes ORDER BY idx_scan ASC;
```

#### Create Indexes
```python
# In models.py

class Product(models.Model):
    name = models.CharField(max_length=200, db_index=True)
    category = models.ForeignKey('Category', on_delete=models.CASCADE, db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['name', 'category']),  # Composite index
            models.Index(fields=['-created_at']),  # Descending order
        ]
```

#### Common Index Patterns
```python
# Primary Key (automatic)
id = models.AutoField(primary_key=True)

# Foreign Keys (auto-indexed)
category = models.ForeignKey(Category, on_delete=models.CASCADE)

# Frequent Filters
status = models.CharField(choices=STATUS_CHOICES, db_index=True)

# Sorting
created_at = models.DateTimeField(auto_now_add=True, db_index=True)

# Unique Fields
email = models.EmailField(unique=True)  # Also indexed
```

### Query Optimization

#### Use select_related (ForeignKey)
```python
# Slow: N+1 problem
products = Product.objects.all()
for product in products:
    print(product.category.name)  # N database queries

# Fast: Join table
products = Product.objects.select_related('category')
for product in products:
    print(product.category.name)  # 1 database query
```

#### Use prefetch_related (ManyToMany/Reverse FK)
```python
# Slow: N+1 problem
products = Product.objects.all()
for product in products:
    for review in product.review_set.all():  # N database queries
        print(review.rating)

# Fast: 2 queries (products + reviews)
products = Product.objects.prefetch_related('review_set')
for product in products:
    for review in product.review_set.all():
        print(review.rating)
```

#### Limit Fields
```python
# Fetch all fields (unnecessary)
products = Product.objects.all()

# Fetch only needed fields
products = Product.objects.only('id', 'name', 'price')

# Defer loading heavy fields
products = Product.objects.defer('description', 'image_base64')
```

#### Aggregate Instead of Loop
```python
# Slow: Load all products in memory
total = 0
for product in Product.objects.all():
    total += product.price

# Fast: Database calculates sum
from django.db.models import Sum
total = Product.objects.aggregate(total=Sum('price'))['total']
```

### Caching

#### Query Result Caching
```python
from django.core.cache import cache
from django.views.decorators.cache import cache_page

# Cache entire view (30 seconds)
@cache_page(30)
def product_list(request):
    return JsonResponse(ProductSerializer(
        Product.objects.all(), 
        many=True
    ).data, safe=False)

# Cache specific queries
def get_featured_products():
    cache_key = 'featured_products'
    products = cache.get(cache_key)
    
    if products is None:
        products = Product.objects.filter(featured=True)[:5]
        cache.set(cache_key, products, 3600)  # 1 hour
    
    return products
```

---

## Data Export & Import

### Export Data

#### CSV Export
```bash
# Django shell
python manage.py shell

>>> from shop.models import Product
>>> import csv
>>> 
>>> with open('products.csv', 'w') as f:
...     writer = csv.writer(f)
...     writer.writerow(['ID', 'Name', 'Price', 'Stock'])
...     for p in Product.objects.all():
...         writer.writerow([p.id, p.name, p.price, p.stock])
```

#### JSON Export
```bash
python manage.py dumpdata shop > data.json
```

### Import Data

#### From JSON
```bash
python manage.py loaddata data.json
```

#### From CSV
```bash
python manage.py shell

>>> import csv
>>> from shop.models import Product, Category
>>>
>>> with open('products.csv', 'r') as f:
...     reader = csv.DictReader(f)
...     for row in reader:
...         category, _ = Category.objects.get_or_create(name=row['category'])
...         Product.objects.create(
...             name=row['name'],
...             price=row['price'],
...             stock=row['stock'],
...             category=category
...         )
```

---

## Troubleshooting

### Connection Issues
```bash
# Test connection
python manage.py dbshell

# Check connection string
python manage.py shell
>>> from django.conf import settings
>>> print(settings.DATABASES)
```

### Migration Issues
```bash
# Show migration status
python manage.py showmigrations

# Check for conflicts
python manage.py makemigrations --check

# Fake migration if needed
python manage.py migrate --fake shop 0001
```

### Data Corruption
```bash
# Check database integrity
REINDEX;  # PostgreSQL in psql shell

# Backup before running
pg_dump ... > backup.sql before_reindex.sql
```

---

## Maintenance Schedule

### Daily
- Monitor connection count
- Check disk space
- Monitor slow queries

### Weekly
- Vacuum (PostgreSQL)
- Reindex frequently accessed tables
- Check backups working

### Monthly
- Analyze query performance
- Review table sizes
- Update statistics

### Quarterly
- Full system review
- Test disaster recovery
- Security audit

---

## Database Monitoring Tools

### Django
- Django Debug Toolbar
- django-extensions
- django-silk (profiling)

### PostgreSQL
- pgAdmin (Web UI)
- DBeaver (Desktop UI)
- pg_stat_statements (query analysis)

### Cloud
- AWS RDS Console
- Google Cloud SQL Console
- Azure Database Monitoring

---

Last Updated: April 4, 2026
