// client/src/App.jsx
import { useState, useEffect } from 'react';
import Login from './Login';
import { api } from './lib/api';          // <-- NEW helper import

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
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h2>{secret || 'Loading secure data…'}</h2>

      {/* Logout clears token & flips auth state */}
      <button onClick={() => { localStorage.removeItem('token'); setAuth(false); }}>
          Logout 
      </button>
    </div>
  );
}
