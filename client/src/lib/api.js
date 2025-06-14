/* Global API root – same rule as in socket.js */
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  'http://localhost:3001';

/* Centralised fetch that always sends the JWT if present */
export async function api(path, options = {}) {
  const token   = localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json'
  };

  /* Resolve relative vs absolute paths */
  const url = path.startsWith('http')
    ? path
    : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const res = await fetch(url, { ...options, headers });

  /* auto-logout on 401 */
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.reload();
    return Promise.reject('Unauthenticated');
  }

  return res.json();
}
