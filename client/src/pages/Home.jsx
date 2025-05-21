import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Home() {
  const nav = useNavigate();

  async function makeRoom() {
    const { code } = await api('/api/rooms', { method: 'POST' });
    nav(`/room/${code}`);
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <button onClick={makeRoom}>New Room</button>
    </div>
  );
}
