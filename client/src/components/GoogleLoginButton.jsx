// client/src/components/GoogleLoginButton.jsx
import { googleSignIn } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function GoogleLoginButton({
  onAuth = () => {},
  className = '',
}) {
  const nav   = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleGoogleLogin() {
    if (busy) return;                      // guard against double-clicks
    setBusy(true);

    try {
      /* 1️⃣ open Google pop-up (Firebase) → get Firebase ID token */
      const fbIdToken = await googleSignIn();

      /* 2️⃣ POST to our backend to exchange for *our* JWT */
      const res  = await fetch(
        (import.meta.env.VITE_API_BASE ?? 'http://localhost:3001') +
          '/api/auth/google',
        {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ token: fbIdToken }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');

      /* 3️⃣ store JWT + update auth state */
      localStorage.setItem('token', data.token);
      onAuth(true);
      nav('/');
    } catch (err) {
      /* Ignore common, harmless pop-up errors */
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return; // user closed / second click → no alert
      }

      /* Anything else is worth surfacing */
      console.error('[Google Sign-In]', err);
      alert(err.message || 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={busy}
      className={`w-full py-2 rounded-md bg-red-600 hover:bg-red-700
                  disabled:opacity-60 text-white font-medium transition
                  ${className}`}
    >
      {busy ? 'Please wait…' : 'Sign in with Google'}
    </button>
  );
}
