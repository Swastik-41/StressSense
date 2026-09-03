const axios = require('axios');
axios.put('http://localhost:8000/api/users/me', {
  age: 22, 
  gender: 'Boy', 
  student_status: 'Student', 
  academic_level: 'Undergraduate'
}, {
  headers: {
    Authorization: 'Bearer mock_token_testuser'
  }
}).then(res => console.log(res.data)).catch(err => console.error(err.response ? err.response.data : err.message));
