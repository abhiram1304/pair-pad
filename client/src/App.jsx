import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Home from './pages/Home';
import RoomPage from './pages/RoomPage';
import { api } from './lib/api';
import PrivateRoute from './components/PrivateRoute';
import RecordingsPage from './pages/RecordingsPage';

export default function App() {
  const [auth, setAuth] = useState(null); // null while loading
  const [secret, setSecret] = useState('');
  const navigate = useNavigate();

  // Check if token is valid
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuth(false);
      return;
    }

    api('/api/secure')
      .then((d) => {
        setSecret(d.secret);
        setAuth(true);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setAuth(false);
      });
  }, []);

  if (auth === null) return null; // wait until token check completes

  return (
    <>
      <Routes>
        {/* Public */}
        {!auth && <Route path="/login" element={<LoginPage onAuth={setAuth} />} />}
        {!auth && <Route path="/register" element={<RegisterPage />} />}

        {/* Protected */}
        <Route
          path="/room/:code"
          element={auth ? <RoomPage /> : <Navigate to="/login" replace />}
        />

        {/* Home is shared for all */}
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route
          path="/recordings"
          element={auth ? <RecordingsPage /> : <Navigate to="/login" replace />}
        />
      </Routes>

      {/* Logout button when logged in */}
      {auth && (
        <button
          className="fixed top-4 right-4 bg-gray-800 hover:bg-gray-700 text-sm px-3 py-1 rounded"
          onClick={() => {
            localStorage.removeItem('token');
            setAuth(false);
            setTimeout(() =>   navigate('/'), 0);
          }}
        >
          Logout
        </button>
      )}
    </>
  );
}
