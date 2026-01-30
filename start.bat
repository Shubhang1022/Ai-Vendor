@echo off
echo 🚀 Starting Vendor Price Platform...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    echo.
)

REM Check if Redis is running
echo 🔍 Checking Redis connection...
redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Redis not found. Attempting to start with Docker...
    docker --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker is not installed. Please install Redis or Docker.
        echo.
        echo 📖 Installation options:
        echo    • Docker Desktop: https://www.docker.com/products/docker-desktop
        echo    • Redis for Windows: https://redis.io/download
        pause
        exit /b 1
    )
    
    echo 📦 Starting Redis container...
    docker run -d --name vendor-platform-redis -p 6379:6379 redis:7-alpine
    timeout /t 5 /nobreak >nul
) else (
    echo ✅ Redis is running
)

echo.
echo 🔧 Starting services...
echo.
echo 📱 Frontend will be available at: http://localhost:3000
echo 🔧 Backend will be available at:  http://localhost:3001
echo ❤️  Health check at:             http://localhost:3001/health
echo.
echo 👤 Demo accounts:
echo    Admin:  admin@vendorplatform.com / admin123
echo    Vendor: vendor@example.com / vendor123
echo.
echo ⏹️  Press Ctrl+C to stop all services
echo.

REM Start the application
node start.js