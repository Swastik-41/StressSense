import axios from 'axios';
import { auth } from './firebase';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Remove trailing /api or /api/ to prevent duplicating it since frontend requests hardcode /api/
API_URL = API_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  } else if (import.meta.env.VITE_FIREBASE_API_KEY === 'mock') {
    // Development mock token
    const mockUid = localStorage.getItem('mock_uid');
    if (mockUid) {
      config.headers.Authorization = `Bearer mock_token_${mockUid}`;
    }
  }
  return config;
});

export default api;
