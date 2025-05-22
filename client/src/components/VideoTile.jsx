// client/src/components/VideoTile.jsx
import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { socket } from '../lib/socket';

export default function VideoTile({ roomCode }) {
  const myVideo    = useRef(null);
  const remoteVid  = useRef(null);
  const peerRef    = useRef(null);
  const [ready, setReady] = useState(false);

  // ──────────────────────────────────────────────────────────
  // 1.  Get camera/mic once
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      myVideo.current.srcObject = stream;
      myVideo.current.play();
      // Tell server we have media and are ready to negotiate
      socket.emit('video-ready', { code: roomCode, from: socket.id });
    })();
  }, [roomCode]);

  // ──────────────────────────────────────────────────────────
  // 2.  Handle signalling messages
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    // • First tab to say “video-ready” becomes the initiator
    // • Second tab receives that event and answers
    socket.on('video-ready', ({ from }) => {
      if (from === socket.id) return;          // ignore own
      startPeer(true);                         // I initiate
    });

    socket.on('video-signal', ({ signal, from }) => {
      if (from === socket.id) return;          // ignore own
      if (!peerRef.current) startPeer(false);  // I'm the answerer
      peerRef.current.signal(signal);          // forward signal to peer
    });

    return () => {
      socket.off('video-ready');
      socket.off('video-signal');
      peerRef.current?.destroy();
      peerRef.current = null;
    };
  }, [roomCode]);

  // ──────────────────────────────────────────────────────────
  // 3.  Create Peer
  // ──────────────────────────────────────────────────────────
  function startPeer(initiator) {
    if (peerRef.current) return;               // already started
    const stream = myVideo.current.srcObject;
    const peer = new Peer({ initiator, trickle: false, stream });
    peerRef.current = peer;

    peer.on('signal', (signal) => {
      socket.emit('video-signal', { code: roomCode, signal, from: socket.id });
    });

    peer.on('connect', () => setReady(true));

    peer.on('stream', (remote) => {
      remoteVid.current.srcObject = remote;
      remoteVid.current.play();
    });
  }

  return (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
      <video
        ref={myVideo}
        muted
        playsInline
        style={{ width: '200px', border: '2px solid #555' }}
      />
      <video
        ref={remoteVid}
        playsInline
        style={{
          width: '200px',
          border: ready ? '2px solid #4caf50' : '2px dashed #888',
        }}
      />
    </div>
  );
}
