import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');

  const token      = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const createRoom = () => {
    const id = uuidv4().slice(0, 6);
    navigate(`/room/${id}`);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim()) navigate(`/room/${roomCode.trim()}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  /* ---------- UI ---------- */
  return (
    <div className="flex flex-col gap-1">
      <div className="h-screen w-screen bg-gray-900 text-white grid place-items-center">
        <div className="-translate-y-[15vh] bg-gray-800/90 backdrop-blur-sm p-10
                        rounded-2xl shadow-2xl w-[350px] max-w-full text-center
                        flex flex-col gap-6">

          <h1 className="text-4xl font-extrabold tracking-wide">🚀 PairPad</h1>

          <p className="text-gray-400 text-sm whitespace-nowrap text-center self-center">
            Welcome! Join or create a room — code together in real time.
          </p>

          {/* ---------------- GUEST VIEW ---------------- */}
          {!isLoggedIn && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="auth-btn w-full py-2 text-base"
              >
                🔐 Login
              </button>

              <button
                onClick={() => navigate('/register')}
                className="auth-btn w-full py-2 text-base"
              >
                📝 Register
              </button>
            </div>
          )}

          {/* ------------ AUTHENTICATED VIEW ------------ */}
          {isLoggedIn && (
            <div className="flex flex-col space-y-1">
              <button
                onClick={createRoom}
                className="auth-btn w-full py-2 text-base"
              >
                ➕ Create New Room
              </button>

              {/* join existing room */}
              <form onSubmit={joinRoom} className="space-y-1" style={{ marginTop: '4px' }}>
                <input
                  type="text"
                  placeholder="Enter Room Code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white
                             border border-gray-600 focus:outline-none
                             focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="submit"
                  className="auth-btn w-full py-2 text-base"
                  style={{ marginTop: '4px' }}
                >
                  🔑 Join Room
                </button>
              </form>

              <button
                onClick={() => navigate('/recordings')}
                className="auth-btn w-full py-2 text-base"
                style={{ marginTop: '4px' }}
              >
                🎥 View Recordings
              </button>

              <button
                onClick={handleLogout}
                className="auth-btn w-full py-2 text-base"
                style={{ marginTop: '4px' }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
