import { Link } from 'react-router-dom';

export default function AuthLanding() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Welcome to PairPad</h1>
      <p className="mb-8 text-gray-400">Collaborative coding, video, and execution — all in one.</p>

      <div className="flex gap-4">
        <Link to="/login">
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold shadow">
            Login
          </button>
        </Link>
        <Link to="/register">
          <button className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-semibold shadow">
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}
