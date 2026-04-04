# SHIKHAR OUTDOOR

A full-stack outdoor apparel e-commerce website built with React (frontend) and Django REST Framework (backend). Inspired by premium alpine brands, SHIKHAR OUTDOOR ("shikhar" = peak/summit in Hindi) is designed around a Himalayan adventure aesthetic — deep forest greens, warm amber, and clean typography using Playfair Display and DM Sans.

**⚠️ Note: This project is currently in development and not yet production-ready. See the [Production Readiness Assessment](#production-readiness) section below.**

## 🏔️ Features

### Frontend (React + Vite)
- **Multi-page Application**: Home, Men's, Women's, Footwear, About, Collection, Product Details, Admin, Login, Profile, My Orders, Blog, Terms
- **Responsive Design**: Mobile-first approach with hamburger menu and adaptive layouts
- **Animations**: Scroll-triggered loading screen, parallax effects, IntersectionObserver reveal animations, animated counters
- **Interactive Elements**: Sticky navbar with blur transitions, product card hover effects, scroll progress bar
- **State Management**: React Context API for user authentication, cart, and orders
- **Google OAuth Integration**: Social login with Google accounts

### Backend (Django REST Framework)
- **RESTful API**: Complete e-commerce API with JWT authentication
- **User Management**: Registration, login, profile management, Google OAuth
- **Product Management**: Categories, products, images, inventory tracking
- **Shopping Cart & Orders**: Full cart functionality with order processing
- **Admin Panel**: Django admin interface for content management
- **File Uploads**: Product images with media handling
- **Chat System**: Basic chat functionality for customer support

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - UI framework
- **Vite 7.3** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS Modules** - Scoped styling
- **ESLint** - Code linting

### Backend
- **Django 6.0** - Web framework
- **Django REST Framework** - API framework
- **JWT Authentication** - Token-based auth
- **SQLite** (development) / **PostgreSQL** (production) - Database
- **Pillow** - Image processing
- **Boto3** - AWS S3 integration
- **CORS Headers** - Cross-origin resource sharing

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Git**
- **PostgreSQL** (for production deployment)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/peak-path-engine.git
cd peak-path-engine
```

### 2. Backend Setup (Django)

#### Create Virtual Environment
```bash
# Windows
python -m venv myapp
myapp\Scripts\activate

# macOS/Linux
python -m venv myapp
source myapp/bin/activate
```

#### Install Python Dependencies
```bash
cd shikharOutdoor
pip install -r requirements.txt
```

#### Environment Variables
Create a `.env` file in the `shikharOutdoor` directory:
```env
DEBUG=True
SECRET_KEY=your-django-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3  # For development
# For production: DATABASE_URL=postgresql://user:password@localhost:5432/shikharoutdoor

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email settings (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# AWS S3 (for production file storage)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1
```

#### Database Setup
```bash
# Run migrations
python manage.py migrate

# Create superuser (for admin access)
python manage.py createsuperuser

# (Optional) Load sample data
python manage.py loaddata fixtures/sample_data.json
```

### 3. Frontend Setup (React)

#### Install Dependencies
```bash
npm install
```

#### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🏃 Running the Application

### Development Mode
1. **Start Backend** (in one terminal):
   ```bash
   cd shikharOutdoor
   python manage.py runserver
   ```
   Backend will be available at: http://127.0.0.1:8000

2. **Start Frontend** (in another terminal):
   ```bash
   npm run dev
   ```
   Frontend will be available at: http://localhost:5173

### Production Build
```bash
# Build frontend
npm run build

# Collect static files (Django)
cd shikharOutdoor
python manage.py collectstatic --noinput

# Run with production server
pip install gunicorn
gunicorn shikharOutdoor.wsgi:application --bind 0.0.0.0:8000
```

## 📚 API Documentation

The API documentation is available via Swagger UI when the backend is running:
- **Swagger UI**: http://127.0.0.1:8000/swagger/
- **ReDoc**: http://127.0.0.1:8000/redoc/

### Key Endpoints
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/products/` - List products
- `POST /api/cart/add/` - Add to cart
- `POST /api/orders/create/` - Create order

## 🧪 Testing

### Backend Tests
```bash
cd shikharOutdoor
python manage.py test
```

### Frontend Tests
```bash
npm test
```

## 🚢 Deployment

### Prerequisites for Production
- PostgreSQL database
- Redis (for caching, optional)
- AWS S3 bucket (for file storage)
- Domain with SSL certificate

### Recommended Deployment Stack
- **Web Server**: Nginx + Gunicorn
- **Database**: PostgreSQL
- **File Storage**: AWS S3
- **Caching**: Redis
- **Monitoring**: Sentry for error tracking

### Environment Checklist
- [ ] `DEBUG=False`
- [ ] `SECRET_KEY` set to strong random value
- [ ] `ALLOWED_HOSTS` configured
- [ ] Database URL set to PostgreSQL
- [ ] HTTPS enabled
- [ ] Static files configured
- [ ] Media files on S3

## 🔒 Security Notes

**Important**: This application is not yet production-ready. Before deploying:

1. **Secrets Management**: Never commit secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **Database**: Switch from SQLite to PostgreSQL
4. **Security Headers**: Configure proper security headers
5. **Testing**: Implement comprehensive test coverage
6. **Monitoring**: Set up error tracking and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint rules for frontend code
- Use Django's coding standards for backend
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by premium outdoor brands like Patagonia and Arc'teryx
- Built with modern web technologies and best practices
- Designed for the Himalayan adventure community

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.

---

## Production Readiness Assessment

**Current Status: NOT PRODUCTION-READY** (Score: 2/10)

### Critical Issues to Address:
- **Security**: Exposed secrets, debug mode, missing HTTPS
- **Database**: SQLite not suitable for production
- **Testing**: Zero test coverage
- **Configuration**: Missing environment variable management
- **Deployment**: No production build configuration

### Next Steps:
1. Implement security hardening (secrets, HTTPS, headers)
2. Migrate to PostgreSQL database
3. Add comprehensive testing
4. Configure production deployment pipeline
5. Set up monitoring and logging

See the full assessment in the project documentation for detailed remediation steps.
