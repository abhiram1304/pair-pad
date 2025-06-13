import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function RegisterPage({ onAuth = () => {} }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr]           = useState('');
  const nav = useNavigate();

  /* email / password register */
  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_BASE ?? 'http://localhost:3001') +
          '/api/auth/register',
        {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('token', data.token);
      onAuth(true);
      nav('/');                        // back to home
    } catch (err) {
      console.error(err);
      setErr(err.message);
    }
  }

  /* ---------- UI ---------- */
  return (
    <div className="flex flex-col gap-1">
      <div className="h-screen w-screen bg-gray-900 text-white grid place-items-center">
        <div className="-translate-y-[15vh] bg-gray-800/90 backdrop-blur-sm p-10
                        rounded-2xl shadow-2xl w-[350px] max-w-full text-center
                        flex flex-col gap-6">

          <h1 className="text-4xl font-extrabold tracking-wide">🚀 PairPad</h1>
          <h2 className="text-2xl font-semibold">Create your account</h2>

          {/* form */}
          <form onSubmit={handleSubmit}>
            {/* Email + Password with 4 px gap */}
            <div className="space-y-1">
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white
                           border border-gray-600 focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white
                           border border-gray-600 focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {err && <p className="text-red-400 text-sm mt-1">{err}</p>}

            {/* Register button – 4 px below password block */}
            <button
              type="submit"
              className="auth-btn w-full py-2 text-base"
              style={{ marginTop: '4px' }}
            >
              Register
            </button>
          </form>

          {/* Home / Login row – 4 px below Register */}
          <div
            className="flex gap-4 justify-center"
            style={{ marginTop: '4px' }}
          >
            <Link to="/"      className="auth-btn w-full py-2 text-base">Home</Link>
            <Link to="/login" className="auth-btn w-full py-2 text-base">Login</Link>
          </div>

          {/* Google sign-in – another 4 px gap */}
          <div style={{ marginTop: '4px' }}>
            <GoogleLoginButton
              onAuth={onAuth}
              className="auth-btn w-full py-2 text-base google-btn"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
