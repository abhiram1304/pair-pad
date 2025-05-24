// client/src/components/RunConsole.jsx
import { useEffect, useState } from 'react';
import { socket } from '../lib/socket';
import { api } from '../lib/api';

/**  Mini console that lets the user choose a language,
 *   click “Run”, and watch the program’s output stream
 *   back from the Docker sandbox.                           */
export default function RunConsole({ editorRef }) {
  const [lang,    setLang]    = useState('javascript'); // JS by default
  const [logs,    setLogs]    = useState([]);           // array of {type,data}
  const [running, setRunning] = useState(false);

  /* ────────────────────────────────────────────────────────
   * 1.  Send code to /api/run and join the job room
   * ──────────────────────────────────────────────────────── */
  async function handleRun() {
    setLogs([]);          // clear previous output
    setRunning(true);

    const code = editorRef.current.getValue();

    // POST to the back-end
    const { jobId } = await api('/api/run', {
      method: 'POST',
      body: JSON.stringify({ code, language: lang }),
    });

    // join a private Socket.IO room named after jobId
    socket.emit('join-room', jobId);

    // leave when server says we're done
    socket.once('run-done', () => {
      socket.emit('leave-room', jobId);
      setRunning(false);
    });
  }

  /* ────────────────────────────────────────────────────────
   * 2.  Collect stdout / stderr streaming back
   * ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const onOut = ({ type, data }) =>
      setLogs((old) => [...old, { type, data }]);

    socket.on('run-out', onOut);
    return () => socket.off('run-out', onOut);
  }, []);

  /* ────────────────────────────────────────────────────────
   * 3.  Render dropdown, button, and console pane
   * ──────────────────────────────────────────────────────── */
  return (
    <div style={{ marginTop: '1rem' }}>
      <select value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="javascript">JavaScript (Node 20)</option>
        <option value="python">Python 3.11</option>
        <option value="cpp">C++ 17</option>
      </select>

      <button
        disabled={running}
        onClick={handleRun}
        style={{ marginLeft: '0.5rem' }}
      >
        {running ? `Running (${lang})…` : `Run (${lang})`}
      </button>

      <pre
        style={{
          background: '#111',
          padding: '0.5rem',
          height: '150px',
          overflowY: 'auto',
          border: '1px solid #333',
          marginTop: '0.5rem',
          color: '#ddd',
        }}
      >
        {logs.map((l, i) => (
          <span
            key={i}
            style={{ color: l.type === 'stderr' ? '#f55' : '#9f9' }}
          >
            {l.data}
          </span>
        ))}
      </pre>
    </div>
  );
}
