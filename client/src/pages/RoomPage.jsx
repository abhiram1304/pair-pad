// client/src/pages/RoomPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../lib/socket';

export default function RoomPage() {
  const { code } = useParams();
  const [text, setText] = useState('');

  // 1️⃣ connect & join once
  useEffect(() => {
    socket.connect();
    socket.emit('join-room', code);

    return () => socket.disconnect();   // cleanup on leave
  }, [code]);

  // 2️⃣ listen for incoming edits
  useEffect(() => {
    socket.on('code-change', setText);
    return () => socket.off('code-change', setText);
  }, []);

  // 3️⃣ local typing → broadcast
  function handle(e) {
    const t = e.target.value;
    setText(t);
    socket.emit('code-change', { code, text: t });
  }

  return (
    <>
      <h2 style={{ textAlign: 'center' }}>Room {code}</h2>
      <textarea
        value={text}
        onChange={handle}
        style={{ width: '80%', height: '300px', display: 'block', margin: '1rem auto' }}
      />
    </>
  );
}
