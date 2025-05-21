// client/src/App.jsx
import { useState, useEffect } from 'react';
import Login from './Login';
import { api } from './lib/api';          // <-- NEW helper import
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import RoomPage from './pages/RoomPage';

export default function App() {
  const [auth, setAuth]     = useState(() => !!localStorage.getItem('token'));
  const [secret, setSecret] = useState('');

  // ================================================================
  // 1. After a successful login (auth === true), fetch secure data
  // ================================================================
  useEffect(() => {
    if (!auth) return;                   // still on the login page

    api('/api/secure')
      .then(d => setSecret(d.secret))
      .catch(() => setSecret('❌ token invalid — re-login'));
  }, [auth]);

  // ================================================================
  // 2. If not authenticated, show the Login form
  // ================================================================
  if (!auth) return <Login onAuth={setAuth} />;

  // ================================================================
  // 3. Authenticated view with secure message + Logout button
  // ================================================================
  return (
  <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:code" element={<RoomPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    {/* simple logout button */}
    <button
      style={{ position: 'fixed', top: 20, right: 20 }}
      onClick={() => {
        localStorage.removeItem('token');
        setAuth(false);
      }}
    >
      Logout
    </button>
  </>
);
}
