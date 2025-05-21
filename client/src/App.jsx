import { useState, useEffect } from 'react';
import Login from './Login';

export default function App() {
  const [auth, setAuth] = useState(false);
  const [secret, setSecret] = useState('');

  // call the protected route after a successful login
  useEffect(() => {
    if (!auth) return;

    fetch('/api/secure', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`  // Bearer standard :contentReference[oaicite:2]{index=2}
      }
    })
      .then(r => r.json())
      .then(d => setSecret(d.secret))
      .catch(() => setSecret('❌ token expired? re-login'));
  }, [auth]);

  if (!auth) return <Login onAuth={setAuth} />;
  return <h2>{secret || 'Loading secure data…'}</h2>;
}
