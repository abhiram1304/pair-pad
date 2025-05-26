/* client/src/pages/Home.jsx */
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  /* create a random room and navigate there */
  function createRoom() {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase(); // e.g. "AB12C"
    navigate(`/room/${code}`);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-start">
      {/* top-left toolbar */}
      <div className="flex items-center gap-4 p-4">
        <button
          onClick={createRoom}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          ➕ New Room
        </button>

        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.reload();
          }}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
