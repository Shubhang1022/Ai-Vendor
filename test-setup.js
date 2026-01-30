#!/usr/bin/env node

const { spawn } = require('child_process');
const axios = require('axios');

console.log('🧪 Testing Vendor Price Platform Setup...\n');

// Test Redis connection
async function testRedis() {
  return new Promise((resolve) => {
    const redis = spawn('redis-cli', ['ping'], { stdio: 'pipe' });
    redis.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Redis is running');
        resolve(true);
      } else {
        console.log('❌ Redis is not running');
        resolve(false);
      }
    });
    redis.on('error', () => {
      console.log('❌ Redis CLI not found');
      resolve(false);
    });
  });
}

// Test backend health
async function testBackend() {
  try {
    const response = await axios.get('http://localhost:3001/health', { timeout: 5000 });
    if (response.status === 200) {
      console.log('✅ Backend is healthy');
      return true;
    }
  } catch (error) {
    console.log('❌ Backend is not responding');
    return false;
  }
}

// Test frontend
async function testFrontend() {
  try {
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    if (response.status === 200) {
      console.log('✅ Frontend is accessible');
      return true;
    }
  } catch (error) {
    console.log('❌ Frontend is not responding');
    return false;
  }
}

// Test authentication API
async function testAuth() {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@vendorplatform.com',
      password: 'admin123'
    }, { timeout: 5000 });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Authentication is working');
      return true;
    }
  } catch (error) {
    console.log('❌ Authentication failed');
    return false;
  }
}

async function runTests() {
  console.log('Running system tests...\n');
  
  const redisOk = await testRedis();
  
  if (!redisOk) {
    console.log('\n💡 To start Redis:');
    console.log('   npm run setup:redis');
    console.log('   OR install Redis locally');
    return;
  }
  
  console.log('\n⏳ Waiting for services to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const backendOk = await testBackend();
  const frontendOk = await testFrontend();
  
  if (backendOk) {
    await testAuth();
  }
  
  console.log('\n📊 Test Results:');
  console.log(`   Redis:    ${redisOk ? '✅' : '❌'}`);
  console.log(`   Backend:  ${backendOk ? '✅' : '❌'}`);
  console.log(`   Frontend: ${frontendOk ? '✅' : '❌'}`);
  
  if (redisOk && backendOk && frontendOk) {
    console.log('\n🎉 All systems are working!');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend:  http://localhost:3001');
  } else {
    console.log('\n⚠️  Some services are not running. Please check the setup.');
  }
}

runTests().catch(console.error);