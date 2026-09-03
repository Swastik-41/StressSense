import axios from 'axios';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
