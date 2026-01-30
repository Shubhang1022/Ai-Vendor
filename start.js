#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Vendor Price Platform...\n');

// Check if Redis is running
function checkRedis() {
  return new Promise((resolve) => {
    const redis = spawn('redis-cli', ['ping'], { stdio: 'pipe' });
    redis.on('close', (code) => {
      resolve(code === 0);
    });
    redis.on('error', () => {
      resolve(false);
    });
  });
}

// Start Redis with Docker
function startRedis() {
  return new Promise((resolve, reject) => {
    console.log('📦 Starting Redis with Docker...');
    const docker = spawn('docker', [
      'run', '-d', '--name', 'vendor-platform-redis',
      '-p', '6379:6379', 'redis:7-alpine'
    ], { stdio: 'inherit' });
    
    docker.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Redis started successfully\n');
        resolve();
      } else {
        console.log('⚠️  Redis container might already exist, continuing...\n');
        resolve(); // Continue anyway, container might already exist
      }
    });
    
    docker.on('error', (err) => {
      console.error('❌ Failed to start Redis:', err.message);
      reject(err);
    });
  });
}

// Start a service
function startService(name, command, cwd, color = '\x1b[36m') {
  const reset = '\x1b[0m';
  const service = spawn('npm', ['run', command], {
    cwd: cwd,
    stdio: 'pipe',
    shell: true
  });

  service.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      console.log(`${color}[${name}]${reset} ${line}`);
    });
  });

  service.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      console.log(`${color}[${name}]${reset} ${line}`);
    });
  });

  service.on('close', (code) => {
    console.log(`${color}[${name}]${reset} Process exited with code ${code}`);
  });

  return service;
}

async function main() {
  try {
    // Check if Redis is running
    const redisRunning = await checkRedis();
    
    if (!redisRunning) {
      console.log('⚠️  Redis not found, attempting to start with Docker...');
      try {
        await startRedis();
        // Wait a moment for Redis to fully start
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (err) {
        console.error('❌ Failed to start Redis. Please install Redis or Docker.');
        console.log('\n📖 Installation options:');
        console.log('   • Docker: npm run setup:redis');
        console.log('   • macOS: brew install redis');
        console.log('   • Windows: Download from https://redis.io/download');
        console.log('   • Linux: sudo apt-get install redis-server');
        process.exit(1);
      }
    } else {
      console.log('✅ Redis is running\n');
    }

    // Check if .env file exists
    const envPath = path.join(__dirname, 'services', 'auth', '.env');
    if (!fs.existsSync(envPath)) {
      console.log('⚠️  Creating .env file for auth service...');
      const envExample = path.join(__dirname, 'services', 'auth', '.env.example');
      if (fs.existsSync(envExample)) {
        fs.copyFileSync(envExample, envPath);
        console.log('✅ .env file created\n');
      }
    }

    console.log('🔧 Starting services...\n');

    // Start backend service
    const backend = startService(
      'Backend',
      'dev',
      path.join(__dirname, 'services', 'auth'),
      '\x1b[32m' // Green
    );

    // Wait a moment for backend to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start frontend service
    const frontend = startService(
      'Frontend',
      'dev',
      path.join(__dirname, 'frontend'),
      '\x1b[34m' // Blue
    );

    console.log('\n🎉 Services starting up...');
    console.log('📱 Frontend: http://localhost:3000');
    console.log('🔧 Backend:  http://localhost:3001');
    console.log('❤️  Health:   http://localhost:3001/health');
    console.log('\n👤 Demo accounts:');
    console.log('   Admin:  admin@vendorplatform.com / admin123');
    console.log('   Vendor: vendor@example.com / vendor123');
    console.log('\n⏹️  Press Ctrl+C to stop all services\n');

    // Handle shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down services...');
      backend.kill();
      frontend.kill();
      process.exit(0);
    });

    // Keep the process alive
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Failed to start application:', error.message);
    process.exit(1);
  }
}

main();