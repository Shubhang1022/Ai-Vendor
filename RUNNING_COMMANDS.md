# 🚀 Running Commands - Vendor Price Platform

## Quick Start (Easiest)

### Windows
```bash
# Double-click start.bat or run:
start.bat
```

### macOS/Linux
```bash
# Make executable and run:
chmod +x start.js
npm start
```

## Manual Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Redis (Required)

**Option A: Docker (Recommended)**
```bash
npm run setup:redis
```

**Option B: Local Installation**
- **Windows**: Download from https://redis.io/download
- **macOS**: `brew install redis && brew services start redis`
- **Linux**: `sudo apt-get install redis-server && sudo systemctl start redis`

### 3. Start Services

**Start Everything:**
```bash
npm run dev
```

**Start Individually:**
```bash
# Terminal 1 - Backend (Port 3001)
npm run dev:backend

# Terminal 2 - Frontend (Port 3000)  
npm run dev:frontend
```

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main web application |
| **Backend API** | http://localhost:3001 | REST API endpoints |
| **Health Check** | http://localhost:3001/health | Service status |

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@vendorplatform.com | admin123 |
| **Vendor** | vendor@example.com | vendor123 |

## Docker Commands

```bash
# Start all services with Docker
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

## Troubleshooting

### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping

# Start Redis with Docker
npm run setup:redis

# Or start manually
redis-server
```

### Port Conflicts
```bash
# Kill processes on ports
npx kill-port 3000
npx kill-port 3001
```

### Clean Restart
```bash
# Stop all services
npm run docker:down

# Remove Redis container
docker rm -f vendor-platform-redis

# Restart everything
npm start
```

## Development Commands

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Environment Setup

Create `services/auth/.env`:
```env
PORT=3001
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_HOST=localhost
REDIS_PORT=6379
ALLOWED_ORIGINS=http://localhost:3000
```

## API Testing

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vendorplatform.com","password":"admin123"}'

# Get profile (replace TOKEN)
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Features Available

### ✅ Working Features
- User authentication (login/logout)
- JWT token management
- Multi-factor authentication (MFA)
- Password change
- User profile management
- Role-based access control
- Responsive dashboard
- Security features (rate limiting, CORS, etc.)

### 🎯 How to Test
1. **Login**: Use demo accounts to access the system
2. **Dashboard**: View user stats and activity
3. **Profile**: Change password and view user info
4. **MFA Setup**: Enable/disable two-factor authentication
5. **Security**: Test rate limiting with multiple login attempts

## Next Steps

After getting the application running:

1. **Explore the Dashboard** - See the main interface
2. **Set up MFA** - Test the security features
3. **Check API Endpoints** - Use the health check and auth endpoints
4. **Review Code Structure** - Understand the architecture
5. **Run Tests** - Execute the test suite

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check service logs for error messages
4. Ensure ports 3000, 3001, and 6379 are available
5. Review the README.md for detailed documentation