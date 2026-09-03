import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const isMock = import.meta.env.VITE_AUTH_MODE === 'mock' || import.meta.env.VITE_FIREBASE_API_KEY === 'mock';

let auth = null;
let app = null;

if (!isMock) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  // Mock auth for development
  auth = {
    currentUser: null,
    onAuthStateChanged: (cb) => {
      const mockUid = localStorage.getItem('mock_uid');
      if (mockUid) {
        cb({ uid: mockUid, email: 'mock@example.com' });
      } else {
        cb(null);
      }
      return () => {};
    },
    signOut: () => {
      localStorage.removeItem('mock_uid');
      window.location.href = '/login';
    }
  };
}

export { auth, app, isMock };
