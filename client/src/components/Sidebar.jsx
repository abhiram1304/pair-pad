/* client/src/components/Sidebar.jsx */
import { useEffect, useState } from 'react';
import { socket } from '../lib/socket';

export default function Sidebar({ roomCode, me }) {
  const [users, setUsers] = useState([]);

  /* join + heartbeat */
  useEffect(() => {
    socket.emit('presence-join', { room: roomCode, name: me });
    const iv = setInterval(
      () => socket.emit('presence-ping', { room: roomCode }),
      10_000
    );
    socket.on('presence-list', setUsers);
    return () => {
      clearInterval(iv);
      socket.off('presence-list', setUsers);
    };
  }, [roomCode, me]);

  return (
    <aside className="w-48 min-w-[12rem] flex-shrink-0 border-l border-gray-700 p-4 text-sm bg-gray-800/60 backdrop-blur">
      <h3 className="text-gray-300 font-semibold mb-2">
        Room {roomCode}
      </h3>

      <button
        className="mb-4 w-full text-xs bg-indigo-600 hover:bg-indigo-700
                   text-white py-1 rounded"
        onClick={() => navigator.clipboard.writeText(window.location.href)}
      >
        Copy invite link
      </button>

      <ul className="space-y-1">
        {users.map((u, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className={
                'h-2 w-2 rounded-full ' +
                (u.idle ? 'bg-yellow-400' : 'bg-green-500')
              }
            />
            <span className="text-gray-200 truncate">{u.name}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
