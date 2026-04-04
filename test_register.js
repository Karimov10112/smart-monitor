const axios = require('axios');

async function testRegister() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      email: 'test' + Math.floor(Math.random() * 10000) + '@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      language: 'uz'
    });
    console.log('Register Success:', res.data);
  } catch (err) {
    console.error('Register Failed:', err.response?.data || err.message);
  }
}

testRegister();
