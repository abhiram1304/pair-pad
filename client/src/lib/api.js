// Centralised fetch that always sends the JWT if present
export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };
  const res = await fetch(path, { ...options, headers });
  // Optional: auto-logout on 401
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.reload();          // kick back to Login
    return Promise.reject('Unauthenticated');
  }
  return res.json();
}
