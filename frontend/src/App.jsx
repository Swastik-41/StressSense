import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Consent from './pages/Consent';
import Instructions from './pages/Instructions';
import Assessment from './pages/Assessment';
import Result from './pages/Result';
import History from './pages/History';
import Navbar from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/consent" element={<ProtectedRoute><Consent /></ProtectedRoute>} />
            <Route path="/instructions" element={<ProtectedRoute><Instructions /></ProtectedRoute>} />
            <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
            <Route path="/result/:assessmentId" element={<ProtectedRoute><Result /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
