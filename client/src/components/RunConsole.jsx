import { useEffect, useState } from 'react';
import { socket } from '../lib/socket';
import { api } from '../lib/api';

export default function RunConsole({ roomCode, editorRef }) {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);

  function run() {
    setLogs([]);
    setRunning(true);
    api('/api/run', {
      method: 'POST',
      body: JSON.stringify({ code: editorRef.current.getValue(), language: 'javascript' }),
    }).then(({ jobId }) => {
      socket.emit('join-room', jobId);          // reuse room mechanism
      socket.once('run-done', () => {
        setRunning(false);
        socket.emit('leave-room', jobId);
      });
    });
  }

  useEffect(() => {
    const out = ({ type, data }) => setLogs(l => [...l, { type, data }]);
    socket.on('run-out', out);
    return () => socket.off('run-out', out);
  }, []);

  return (
    <div style={{ marginTop: '1rem' }}>
      <button disabled={running} onClick={run}>
        {running ? 'Running…' : 'Run'}
      </button>
      <pre style={{
        background: '#111',
        color: '#0f0',
        padding: '0.5rem',
        height: '150px',
        overflowY: 'auto'
      }}>
        {logs.map((l, i) => (
          <span key={i} style={{ color: l.type === 'stderr' ? '#f55' : '#0f0' }}>
            {l.data}
          </span>
        ))}
      </pre>
    </div>
  );
}
