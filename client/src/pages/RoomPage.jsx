/* client/src/pages/RoomPage.jsx */
import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { RemoteCursorManager } from '@convergencelabs/monaco-collab-ext';
import { v4 as uuidv4 } from 'uuid';
import { socket } from '../lib/socket';
import VideoTile from '../components/VideoTile.jsx';
import RunConsole from '../components/RunConsole';
import Sidebar from '../components/Sidebar';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const colourFor = (id) =>
  `hsl(${[...id].reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0) % 360},70%,70%)`;

export default function RoomPage() {
  const { code } = useParams();
  const [language, setLanguage] = useState("javascript");
  const [myName] = useState(() => {
    const base = prompt('Name?', 'Guest') || 'Guest';
    return base + Math.floor(Math.random() * 1000); // e.g., Guest423
  });
  const [recording, setRecording] = useState(false);
  const [output, setOutput] = useState('');

  const editorRef = useRef(null);
  const cursorMgr = useRef(null);
  const colourMap = useRef(new Map());
  const mediaRec = useRef(null);

  useEffect(() => {
    socket.connect();
    socket.emit('join-room', code);
    return () => socket.disconnect();
  }, [code]);

  useEffect(() => {
    const h = ({ text, from }) => {
      if (from === socket.id) return;
      const m = editorRef.current?.getModel();
      if (m && m.getValue() !== text) m.setValue(text);
    };
    socket.on('code-change', h);
    return () => socket.off('code-change', h);
  }, []);

  useEffect(() => {
    const h = ({ from, position }) => {
      if (from === socket.id || !cursorMgr.current) return;
      if (!colourMap.current.has(from))
        colourMap.current.set(from, colourFor(from));

      const cur = cursorMgr.current.getCursor(from)
        || cursorMgr.current.addCursor(from, colourMap.current.get(from), from);
      cur.setPosition(position);
    };
    socket.on('cursor-update', h);
    return () => socket.off('cursor-update', h);
  }, []);

  function onMount(editor) {
    editorRef.current = editor;
    if (!cursorMgr.current)
      cursorMgr.current = new RemoteCursorManager({ editor, tooltips: true });

    editor.onDidChangeCursorPosition(({ position }) =>
      socket.emit('cursor-change', {
        room: code,
        from: socket.id,
        position: { line: position.lineNumber, column: position.column },
      }));
  }

  const runCode = async (lang, codeText) => {
    console.log('[runCode] Triggered');
    console.log('Language:', lang, 'Code:', codeText);

    // Clear output area
    setOutput('');

    let jobId = '';
    try {
      // Step 1: Trigger backend to start code execution
      const res = await fetch(`${API_BASE}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeText, language: lang})
      });

      const data = await res.json();
      jobId = data.jobId; 
      console.log('Backend responded with jobId:', jobId);

      if (!res.ok) {
        setOutput('Error: ' + (data.error || res.statusText));
        return;
      }
    } catch (err) {
      setOutput('Error calling backend: ' + err.toString());
      return;
    }

    // Step 2: Join that job's socket room
    socket.emit('join-room', jobId);

    // Step 3: Set up listeners to collect output and exit code
    const handleOutput = ({ type, data }) => {
      console.log('[run-out]', type, data);
      setOutput(prev => prev + data + '\n');
    };
    const handleDone = ({ exitCode }) => {
      console.log('[run-done]', exitCode);
      setOutput(prev => prev + `\n\nProcess exited with code ${exitCode}`);
      socket.off('run-out', handleOutput);
      socket.off('run-done', handleDone);
    };

    socket.on('run-out', handleOutput);
    socket.on('run-done', handleDone);
  };


  async function toggleRec() {
    if (recording) {
      mediaRec.current.stop();
      setRecording(false);
      return;
    }
    const s = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: 'screen' },
    });
    const rec = new MediaRecorder(s, { mimeType: 'video/webm' });
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const { url, key } = await (
        await fetch(`${API_BASE}/api/presign`)
      ).json();
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'video/webm' },
        body: blob,
      });
      window.open(`https://${url.split('/')[2]}/${key}`, '_blank');
    };
    rec.start();
    mediaRec.current = rec;
    setRecording(true);
  }

  return (
  <div className="h-screen w-screen bg-gray-900 text-white flex overflow-hidden">
    {/* Sidebar */}
    <div className="w-[15rem] bg-gray-800">
      <Sidebar roomCode={code} me={myName} />
    </div>

    {/* Main Content */}
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Video Tiles */}
      <div className="flex justify-center items-center gap-4 py-2 bg-gray-800">
        <VideoTile roomCode={code} />
        <div className="w-52 h-36 border-2 border-dashed border-gray-500" />
      </div>

      {/* Buttons below video tiles (left-aligned) */}
      <div className="flex items-center gap-[3px] px-4 py-2 bg-gray-900">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-800 border border-gray-600 text-white text-sm px-2 py-1 rounded"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
        </select>

        <button
          onClick={() => runCode(language, editorRef.current?.getValue())}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold shadow-md"
        >
          {`Run (${language})`}
        </button>

        <button
          onClick={toggleRec}
          className={`px-4 py-2 rounded text-sm font-semibold shadow-md transition ${
            recording
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {recording ? 'Stop' : 'Record'}
        </button>
      </div>

      {/* Editor and Output section */}
      <div className="flex flex-col flex-1 px-4 pb-2 overflow-hidden">
        {/* Editor takes 70% of space */}
        <div className="flex-[0.7] overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// start typing…"
            theme="vs-dark"
            onMount={onMount}
            onChange={(v = '') =>
              socket.emit('code-change', { code, text: v, from: socket.id })
            }
          />
        </div>

        {/* Output area takes remaining 30% */}
        <div className="flex-[0.3] mt-2">
          <textarea
            readOnly
            value={output}
            className="w-full h-full bg-gray-900 border border-gray-700 rounded p-3 text-sm resize-none text-green-400"
          />
        </div>
      </div>
    </div>
  </div>
);
}
