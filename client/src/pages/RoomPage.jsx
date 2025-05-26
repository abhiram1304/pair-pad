/* client/src/pages/RoomPage.jsx */
import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { RemoteCursorManager } from '@convergencelabs/monaco-collab-ext';

import { socket } from '../lib/socket';
import VideoTile from '../components/VideoTile.jsx';
import RunConsole from '../components/RunConsole';
import Sidebar from '../components/Sidebar';

/* pastel colour generator */
const colourFor = (id) =>
  `hsl(${[...id].reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0) % 360},70%,70%)`;

export default function RoomPage() {
  const { code } = useParams();
  const [myName]   = useState(() => prompt('Name?', 'Guest') || 'Guest');
  const [recording, setRecording] = useState(false);
  const [output, setOutput] = useState('');

  const editorRef = useRef(null);
  const cursorMgr = useRef(null);
  const colourMap = useRef(new Map());
  const mediaRec  = useRef(null);

  /* ── socket connect ── */
  useEffect(() => {
    socket.connect();
    socket.emit('join-room', code);
    return () => socket.disconnect();
  }, [code]);

  /* ── remote text ── */
  useEffect(() => {
    const h = ({ text, from }) => {
      if (from === socket.id) return;
      const m = editorRef.current?.getModel();
      if (m && m.getValue() !== text) m.setValue(text);
    };
    socket.on('code-change', h);
    return () => socket.off('code-change', h);
  }, []);

  /* ── remote cursors ── */
  useEffect(() => {
    const h = ({ from, position }) => {
      if (from === socket.id) return;
      if (!cursorMgr.current) return;
      if (!colourMap.current.has(from))
        colourMap.current.set(from, colourFor(from));

      const cur = cursorMgr.current.getCursor(from)
        || cursorMgr.current.addCursor(from, colourMap.current.get(from), from);
      cur.setPosition(position);
    };
    socket.on('cursor-update', h);
    return () => socket.off('cursor-update', h);
  }, []);

  /* ── editor mount ── */
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

  /* ── send my edits ── */
  const onEdit = (v = '') =>
    socket.emit('code-change', { code, text: v, from: socket.id });

  /* ── tiny local runner demo ── */
  const runCode = (lang, txt) => {
    if (lang !== 'javascript')
      return setOutput('only JS runner stubbed here');
    try {
      // ⚠️ demo only – do NOT use eval in production
      setOutput(String(eval(txt)));
    } catch (e) {
      setOutput(e.toString());
    }
  };

  /* ── record screen ── */
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
        await fetch('http://localhost:3001/api/presign')
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

  /* ── layout ── */
  return (
    <div
      className="h-screen bg-gray-900 text-gray-100 grid"
      /* sidebar 12 rem ⟶ rest of screen */
      style={{ gridTemplateColumns: '12rem minmax(0,1fr)' }}
    >
      {/* LEFT  ► sidebar full height */}
      <Sidebar
        roomCode={code}
        me={myName}
        style={{ gridColumn: '1 / 2', gridRow: '1 / -1' }}
      />

      {/* RIGHT ► everything else */}
      <div
        className="flex flex-col h-full w-full overflow-hidden"
        style={{ gridColumn: '2 / -1', gridRow: '1 / -1' }}
      >
        {/* Cameras */}
        <div className="flex justify-start gap-3 p-4 w-full overflow-x-auto shrink-0">
          <VideoTile roomCode={code} />
          <div className="w-52 h-36 border-2 border-dashed border-gray-500" />
        </div>

        {/* Editor */}
        <div className="relative flex-grow px-6">
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

          {/* toolbar */}
          <div className="absolute -top-10 right-6 flex gap-3">
            <RunConsole roomCode={code} editorRef={editorRef} onRun={runCode} />
            <button
              onClick={toggleRec}
              className={`px-3 py-1 rounded text-sm font-semibold ${
                recording
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {recording ? 'Stop' : 'Record'}
            </button>
          </div>
        </div>

        {/* Output */}
        <textarea
          readOnly
          value={output}
          style={{ height: '40vh' }}
          className="mt-4 px-6 pb-4 w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm resize-none shrink-0"
        />
      </div>
    </div>
  );
}
