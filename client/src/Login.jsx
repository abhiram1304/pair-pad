// client/src/Login.jsx
import { useState } from 'react';
import { api } from './lib/api';          

export default function Login({ onAuth }) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd]     = useState('');

  async function handle(e) {
    e.preventDefault();

    // 🔹 Single API call that already returns parsed JSON
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pwd }),
    });

    if (data.token) {
      localStorage.setItem('token', data.token);  // save JWT
      onAuth(true);                               // tell App we’re logged in
    } else {
      alert(data.error || 'Login failed');
    }
  }

  return (
    <form onSubmit={handle}>
      <input
        placeholder="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        value={pwd}
        onChange={e => setPwd(e.target.value)}
      />
      <button>Log in</button>
    </form>
  );
}
