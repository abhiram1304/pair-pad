import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { socket } from '../lib/socket';
import VideoTile from '../components/VideoTile.jsx';


export default function RoomPage() {
  const { code } = useParams();           // room code from the URL
  const editorRef = useRef(null);         // holds monaco editor instance

  // 1️⃣ connect once and join the room
  useEffect(() => {
    socket.connect();
    socket.emit('join-room', code);
    return () => socket.disconnect();     // clean up on unmount
  }, [code]);

  // 2️⃣ listen for edits coming from others
  useEffect(() => {
    const handler = ({ text, from }) => {
      if (from === socket.id) return;     // ignore my own echoes
      const model = editorRef.current?.getModel();
      if (model && text !== model.getValue()) model.setValue(text);
    };
    socket.on('code-change', handler);
    return () => socket.off('code-change', handler);
  }, []);

  // 3️⃣ remember editor instance when ready
  function handleMount(editor) {           
    editorRef.current = editor;
  }
  // 4️⃣ local typing → emit to server
  function handleChange(value = '') {
    socket.emit('code-change', { code, text: value, from: socket.id });
  }

  return (
  <>
    <h2 style={{ textAlign: 'center' }}>Room {code}</h2>

    {/* live video */}
    <VideoTile roomCode={code} />

    {/* monaco editor */}
    <div style={{ height: '70vh', width: '90%', margin: '0 auto' }}>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        defaultValue="// start typing…"
        onMount={handleMount}
        onChange={handleChange}
        theme="vs-dark"
      />
    </div>
  </>
  );
}
