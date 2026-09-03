import { createContext, useContext, useState, useEffect } from 'react';
import { auth, isMock } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    if (isMock) {
      const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
      const userRecord = users[email];
      
      if (!userRecord || userRecord.password !== password) {
        throw new Error('Invalid credentials');
      }
      
      localStorage.setItem('mock_uid', userRecord.uid);
      setUser({ uid: userRecord.uid, email });
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password) => {
    if (isMock) {
      if (password.length < 6) {
        throw new Error('Password too short');
      }
      const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
      if (users[email]) {
        throw new Error('Email already in use');
      }
      
      const newUid = 'mock-user-' + Date.now();
      users[email] = { uid: newUid, email, password };
      localStorage.setItem('mock_users', JSON.stringify(users));
      
      localStorage.setItem('mock_uid', newUid);
      setUser({ uid: newUid, email });
      return;
    }
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (isMock) {
      auth.signOut();
      setUser(null);
      return;
    }
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
