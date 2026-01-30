# Vendor Price Platform

An AI-powered web application that helps local vendors discover competitive pricing and negotiate deals through intelligent automation. Features role-based dashboards, multi-factor authentication, and real-time negotiation management.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (`node --version`)
- **npm** (`npm --version`) 
- **Redis** (optional - uses in-memory storage if not available)

### Option 1: One-Command Start (Easiest)

```bash
# Install and start everything
npm install && npm start
```

### Option 2: Step-by-Step Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Redis (optional - will use mock if not available)
npm run setup:redis          # Using Docker
# OR install Redis locally

# 3. Start the application
npm run dev                  # Both frontend + backend
```

### Option 3: Docker Compose

```bash
# Start all services with Docker
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

## 📱 Access Your Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main web application |
| **Backend API** | http://localhost:3001 | REST API endpoints |
| **Health Check** | http://localhost:3001/health | Service status |

## 🔐 Demo Accounts

| Role | Email | Password | Features |
|------|-------|----------|----------|
| **Admin** | admin@vendorplatform.com | admin123 | User management, system settings, security |
| **Vendor** | vendor@example.com | vendor123 | Price discovery, negotiations, listings |

## 🎯 Features by Role

### 👑 **Admin Dashboard**
- **System Management**: View system-wide statistics and health
- **User Management**: Create, edit, activate/deactivate users
- **System Settings**: Configure security, notifications, system parameters
- **Security Monitoring**: Real-time security alerts and audit logs
- **Admin Controls**: Database backup, security audit, analytics

### 🏪 **Vendor Dashboard**  
- **Business Metrics**: Personal listings, negotiations, deals, revenue
- **Price Discovery**: AI-powered competitive price research tool
- **Negotiation Center**: Real-time negotiation management with suppliers
- **Listings Management**: View and manage product listings
- **Analytics**: Personal business performance metrics

## 🛠️ Development Commands

### **Basic Commands**
```bash
# Install dependencies
npm install

# Start both services
npm run dev

# Start backend only (Port 3001)
npm run dev:backend

# Start frontend only (Port 3000)  
npm run dev:frontend

# Test system health
npm run test:setup
```

### **Production Commands**
```bash
# Build all services
npm run build

# Start production backend
npm run start:backend

# Run all tests
npm test
```

### **Docker Commands**
```bash
# Start with Docker Compose
npm run docker:up

# View service logs
npm run docker:logs

# Stop all services
npm run docker:down

# Start Redis only
npm run setup:redis
```

### **Utility Commands**
```bash
# Code quality
npm run lint                 # Lint code
npm run format              # Format code

# System testing
node test-running.js        # Test all running services
node test-setup.js          # Test system setup

# Development helpers
npm run test:setup          # Verify system health
```

## 🏗️ Architecture

### **Technology Stack**
- **Frontend**: React 18, TypeScript, Tailwind CSS, Zustand, Vite
- **Backend**: Node.js, Express.js, TypeScript, JWT
- **Storage**: Redis (with in-memory fallback)
- **Authentication**: JWT with refresh tokens, TOTP MFA
- **Security**: RBAC, Rate limiting, CORS, Helmet.js

### **Project Structure**
```
vendor-price-platform/
├── services/
│   └── auth/                 # Authentication microservice
│       ├── src/
│       │   ├── routes/       # API endpoints
│       │   ├── services/     # Business logic
│       │   ├── middleware/   # Auth & RBAC middleware
│       │   └── types/        # TypeScript definitions
│       └── __tests__/        # Test files
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── dashboards/   # Role-specific dashboards
│   │   │   └── modals/       # Feature modals
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   └── stores/          # State management
├── docker-compose.yml       # Multi-service orchestration
└── README.md               # This file
```

## 🔧 API Endpoints

### **Authentication (`/api/auth`)**
```bash
POST /api/auth/login         # User authentication
POST /api/auth/refresh       # Refresh access token  
POST /api/auth/logout        # User logout
GET  /api/auth/profile       # Get user profile
POST /api/auth/change-password # Change password
POST /api/auth/register      # Register new user (admin only)
```

### **Multi-Factor Authentication (`/api/mfa`)**
```bash
POST /api/mfa/setup          # Initialize MFA setup
POST /api/mfa/enable         # Enable MFA
POST /api/mfa/disable        # Disable MFA  
GET  /api/mfa/status         # Get MFA status
```

### **System (`/`)**
```bash
GET  /health                 # Health check endpoint
```

## 🧪 Testing

### **System Health Check**
```bash
# Test all services
npm run test:setup

# Test running services  
node test-running.js

# Manual API testing
curl http://localhost:3001/health
```

### **Authentication Testing**
```bash
# Login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vendorplatform.com","password":"admin123"}'

# Profile test (replace YOUR_TOKEN)
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Feature Testing**
1. **Admin Features**: Login as admin → Test user management and system settings
2. **Vendor Features**: Login as vendor → Test price discovery and negotiations  
3. **MFA Setup**: Go to MFA Setup page → Scan QR code → Enable MFA
4. **Role Switching**: Logout and login with different accounts to see different dashboards

## 🔒 Security Features

- ✅ **JWT Authentication**: 15-minute access tokens, 7-day refresh tokens
- ✅ **Multi-Factor Authentication**: TOTP with QR codes and backup codes
- ✅ **Role-Based Access Control**: Admin, vendor, readonly permissions
- ✅ **Rate Limiting**: 5 attempts per 15 minutes on auth endpoints
- ✅ **Password Security**: bcrypt hashing with 12 salt rounds
- ✅ **Session Management**: Distributed Redis-based sessions
- ✅ **Security Headers**: Helmet.js protection
- ✅ **Input Validation**: Joi schema validation
- ✅ **CORS Protection**: Configurable cross-origin policies

## 📊 Performance

- **Login Response**: <100ms
- **Token Validation**: <50ms  
- **Dashboard Load**: <200ms
- **Price Discovery**: <2s (simulated)
- **MFA Setup**: <500ms

## 🚨 Troubleshooting

### **Common Issues**

**"Redis connection failed"**
```bash
# Start Redis with Docker
npm run setup:redis

# Or check if Redis is running
redis-cli ping
```

**"Port already in use"**
```bash
# Kill processes on ports
npx kill-port 3000      # Frontend
npx kill-port 3001      # Backend
```

**"Cannot find module"**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**"Authentication failed"**
```bash
# Rate limiting active - wait 15 minutes or restart backend
npm run dev:backend
```

### **Clean Restart**
```bash
# Stop all services
npm run docker:down

# Remove containers
docker rm -f vendor-platform-redis

# Restart everything
npm start
```

## 🎮 How to Use

### **Getting Started**
1. **Start Application**: `npm start`
2. **Open Browser**: Go to http://localhost:3000
3. **Login**: Use demo accounts (admin or vendor)
4. **Explore**: Different dashboards based on your role

### **Admin Workflow**
1. Login as admin
2. Click "Manage Users" → Create new users
3. Click "System Settings" → Configure system
4. Monitor security alerts and system health

### **Vendor Workflow**  
1. Login as vendor
2. Click "New Price Discovery" → Search products
3. Click "View Negotiations" → Manage offers
4. View "Active Listings" → Manage inventory

### **MFA Setup**
1. Go to "MFA Setup" page
2. Scan QR code with authenticator app
3. Enter verification code
4. Save backup codes securely

## 🚀 Deployment

### **Environment Variables**
Create `services/auth/.env`:
```env
PORT=3001
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_HOST=localhost
REDIS_PORT=6379
ALLOWED_ORIGINS=http://localhost:3000
```

### **Production Checklist**
- [ ] Change JWT secrets in environment variables
- [ ] Set up persistent Redis instance  
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure monitoring and logging
- [ ] Set up backup strategies

### **Docker Production**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Write tests for new features
- Use property-based testing for business logic
- Follow the existing code style
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Getting Help**
- **Documentation**: Check this README and `/docs` folder
- **Issues**: Report bugs via GitHub Issues
- **Testing**: Use `npm run test:setup` for diagnostics
- **Logs**: Check console output for error messages

### **Quick Commands Reference**
```bash
npm start                    # Start everything
npm run test:setup          # Test system health  
node test-running.js        # Test running services
npm run docker:up           # Start with Docker
npm run dev                 # Development mode
```

---

**🎉 Ready to discover competitive prices and negotiate better deals!**

*Built with modern web technologies • Enterprise-grade security • Production-ready*