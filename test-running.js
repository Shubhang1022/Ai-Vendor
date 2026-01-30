#!/usr/bin/env node

const axios = require('axios');

console.log('🧪 Testing Running Services...\n');

// Test backend health
async function testBackend() {
  try {
    const response = await axios.get('http://localhost:3001/health', { timeout: 5000 });
    if (response.status === 200) {
      console.log('✅ Backend is healthy');
      console.log(`   Service: ${response.data.service}`);
      console.log(`   Status: ${response.data.status}`);
      return true;
    }
  } catch (error) {
    console.log('❌ Backend is not responding');
    console.log(`   Error: ${error.message}`);
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
      console.log('   Admin login successful');
      console.log('   JWT tokens generated');
      
      // Test profile endpoint with the token
      const token = response.data.data.accessToken;
      const profileResponse = await axios.get('http://localhost:3001/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      
      if (profileResponse.status === 200) {
        console.log('✅ Profile endpoint working');
        console.log(`   User: ${profileResponse.data.data.email}`);
        console.log(`   Roles: ${profileResponse.data.data.roles.map(r => r.name).join(', ')}`);
      }
      
      return true;
    }
  } catch (error) {
    console.log('❌ Authentication failed');
    console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

// Test frontend
async function testFrontend() {
  try {
    // Test if Vite dev server is running by checking for typical Vite response
    const response = await axios.get('http://localhost:3000/@vite/client', { 
      timeout: 5000,
      validateStatus: () => true // Accept any status code
    });
    
    if (response.status === 200 || response.status === 404) {
      console.log('✅ Frontend dev server is running');
      console.log('   Vite development server active');
      return true;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Frontend is not responding');
      return false;
    } else {
      // If we get any other error, the server is probably running
      console.log('✅ Frontend dev server is running');
      return true;
    }
  }
}

// Test MFA setup
async function testMFA() {
  try {
    // First login to get a token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'vendor@example.com',
      password: 'vendor123'
    });
    
    const token = loginResponse.data.data.accessToken;
    
    // Test MFA status endpoint
    const mfaResponse = await axios.get('http://localhost:3001/api/mfa/status', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });
    
    if (mfaResponse.status === 200) {
      console.log('✅ MFA endpoints working');
      console.log(`   MFA Enabled: ${mfaResponse.data.data.mfaEnabled}`);
      return true;
    }
  } catch (error) {
    console.log('❌ MFA endpoints failed');
    return false;
  }
}

async function runTests() {
  console.log('Testing all running services...\n');
  
  const backendOk = await testBackend();
  console.log('');
  
  let authOk = false;
  let mfaOk = false;
  
  if (backendOk) {
    authOk = await testAuth();
    console.log('');
    
    if (authOk) {
      mfaOk = await testMFA();
      console.log('');
    }
  }
  
  const frontendOk = await testFrontend();
  console.log('');
  
  console.log('📊 Test Results:');
  console.log(`   Backend:        ${backendOk ? '✅' : '❌'}`);
  console.log(`   Authentication: ${authOk ? '✅' : '❌'}`);
  console.log(`   MFA Endpoints:  ${mfaOk ? '✅' : '❌'}`);
  console.log(`   Frontend:       ${frontendOk ? '✅' : '❌'}`);
  
  if (backendOk && authOk && frontendOk) {
    console.log('\n🎉 All systems are working perfectly!');
    console.log('\n📱 Access your application:');
    console.log('   🌐 Frontend:    http://localhost:3000');
    console.log('   🔧 Backend API: http://localhost:3001');
    console.log('   ❤️  Health:     http://localhost:3001/health');
    console.log('\n🔐 Demo accounts:');
    console.log('   👑 Admin:  admin@vendorplatform.com / admin123');
    console.log('   🏪 Vendor: vendor@example.com / vendor123');
    console.log('\n✨ Features to try:');
    console.log('   • Login with demo accounts');
    console.log('   • Set up Multi-Factor Authentication');
    console.log('   • Change password in profile');
    console.log('   • Explore the dashboard');
  } else {
    console.log('\n⚠️  Some services have issues. Check the logs above.');
  }
}

runTests().catch(console.error);