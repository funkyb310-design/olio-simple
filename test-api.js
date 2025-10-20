// Test script to verify API endpoints work

const axios = require('axios');

const API_URL = 'http://172.20.10.11:3000/api';

async function testAPI() {
  console.log('Testing API endpoints...\n');

  // Test 1: Check server is running
  try {
    console.log('1. Testing GET /api/test...');
    const testResponse = await axios.get(`${API_URL}/test`);
    console.log('✅ Success:', testResponse.data);
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }

  // Test 2: Get posts (no auth needed)
  try {
    console.log('\n2. Testing GET /api/posts...');
    const postsResponse = await axios.get(`${API_URL}/posts`);
    console.log('✅ Success:', postsResponse.data);
  } catch (error) {
    console.log('❌ Failed:', error.response?.status, error.response?.data || error.message);
  }

  // Test 3: Login to get token
  let token = null;
  try {
    console.log('\n3. Testing POST /api/auth/login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@test.com',
      password: 'password123'
    });
    token = loginResponse.data.token;
    console.log('✅ Success: Got token');
  } catch (error) {
    console.log('❌ Failed:', error.response?.status, error.response?.data || error.message);
    console.log('(This is OK if user doesn\'t exist)');
  }

  // Test 4: Create post (needs auth)
  if (token) {
    try {
      console.log('\n4. Testing POST /api/posts with auth...');
      const postResponse = await axios.post(
        `${API_URL}/posts`,
        {
          content: 'Test post from script',
          category: 'Olio Love',
          image: ''
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('✅ Success:', postResponse.data);
    } catch (error) {
      console.log('❌ Failed:', error.response?.status, error.response?.data || error.message);
    }
  } else {
    console.log('\n4. Skipping POST /api/posts (no token)');
  }

  console.log('\n--- Test Complete ---');
}

testAPI();
