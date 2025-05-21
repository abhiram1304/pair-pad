import { useState } from 'react';

export default function Login({ onAuth }) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd]   = useState('');

  async function handle(e) {
    e.preventDefault();
    const res  = await fetch('/api/auth/login', {          // proxy handled by Vite :contentReference[oaicite:0]{index=0}
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pwd })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);           // browser-side storage :contentReference[oaicite:1]{index=1}
      onAuth(true);
    } else {
      alert(data.error || 'Login failed');
    }
  }

  return (
    <form onSubmit={handle}>
      <input  placeholder="email"
              value={email}
              onChange={e => setEmail(e.target.value)} />
      <input  type="password"
              placeholder="password"
              value={pwd}
              onChange={e => setPwd(e.target.value)} />
      <button>Log in</button>
    </form>
  );
}
