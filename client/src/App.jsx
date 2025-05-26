// client/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Login     from './Login';
import Home      from './pages/Home';
import RoomPage  from './pages/RoomPage';
import { api }   from './lib/api';        // helper for auth-aware fetches

export default function App() {
  const [auth,   setAuth]   = useState(() => !!localStorage.getItem('token'));
  const [secret, setSecret] = useState('');

  /* 1️⃣  after login, fetch a protected endpoint */
  useEffect(() => {
    if (!auth) return;
    api('/api/secure')
      .then(d => setSecret(d.secret))
      .catch(() => setSecret('❌ token invalid — re-login'));
  }, [auth]);

  /* 2️⃣  not logged-in → show login form */
  if (!auth) return <Login onAuth={setAuth} />;

  /* 3️⃣  logged-in view */
  return (
    <>
      {/* routes */}
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/room/:code"  element={<RoomPage />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>

      {/* logout button */}
      <button
        className="fixed top-4 right-4 bg-gray-800 hover:bg-gray-700
                   text-sm px-3 py-1 rounded"
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
