import { useParams } from 'react-router-dom';

export default function RoomPage() {
  const { code } = useParams();
  return (
    <h2 style={{ textAlign: 'center', marginTop: '3rem' }}>
      Room <strong>{code}</strong> (coming soon…)
    </h2>
  );
}
