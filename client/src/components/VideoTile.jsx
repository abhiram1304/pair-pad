/* client/src/components/VideoTile.jsx */
import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { socket } from '../lib/socket';

export default function VideoTile({ roomCode }) {
  const myVideo   = useRef(null);
  const remoteVid = useRef(null);
  const peerRef   = useRef(null);

  const [ready, setReady]   = useState(false);
  const [muted, setMuted]   = useState(false);

  /* ── get camera/mic ───────────────────────── */
  useEffect(() => {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      myVideo.current.srcObject = stream;
      myVideo.current.play();
      socket.emit('video-ready', { code: roomCode, from: socket.id });
    })();
  }, [roomCode]);

  /* ── signalling handlers ──────────────────── */
  useEffect(() => {
    socket.on('video-ready', ({ from }) => {
      if (from === socket.id) return;
      startPeer(true);                       // I’m the initiator
    });

    socket.on('video-signal', ({ signal, from }) => {
      if (from === socket.id) return;
      if (!peerRef.current) startPeer(false);
      peerRef.current.signal(signal);
    });

    return () => {
      socket.off('video-ready');
      socket.off('video-signal');
      peerRef.current?.destroy();
      peerRef.current = null;
    };
  }, [roomCode]);

  function startPeer(initiator) {
    if (peerRef.current) return;
    const stream = myVideo.current.srcObject;
    const peer   = new Peer({ initiator, trickle: false, stream });
    peerRef.current = peer;

    peer.on('signal',  (signal) => {
      socket.emit('video-signal', { code: roomCode, signal, from: socket.id });
    });
    peer.on('connect', () => setReady(true));
    peer.on('stream',  (remote) => {
      remoteVid.current.srcObject = remote;
      remoteVid.current.play();
    });
  }

  /* ── mute / un-mute ───────────────────────── */
  const toggleMute = () => {
    const track = myVideo.current?.srcObject?.getAudioTracks?.()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  /* inline SVG icons */
  const MicIcon = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2Zm-5 9a7.002 7.002 0 0 0 6.93-6H17.9A5.002 5.002 0 0 1 12 19a5.002 5.002 0 0 1-5.9-5H5.07A7.002 7.002 0 0 0 12 20Z" />
    </svg>
  );

  const MicOffIcon = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M11 5a1 1 0 0 1 2 0v3.586l2 2V5a3 3 0 0 0-6 0v1.586l2 2V5Zm8.707 7.707A7.968 7.968 0 0 0 20 11h-2a5.976 5.976 0 0 1-1.07 3.414l1.415 1.414a7.97 7.97 0 0 0 1.362-3.121Zm-1.414 6.586-14-14-1.414 1.414 4.013 4.013A2.982 2.982 0 0 0 9 11a3 3 0 0 0 3 3c.524 0 1.02-.135 1.455-.368l1.541 1.541A4.973 4.973 0 0 1 12 17a5.002 5.002 0 0 1-5-5H5a7.002 7.002 0 0 0 6.93 6v2h2v-2c.858-.056 1.677-.276 2.422-.626l2.25 2.25 1.414-1.414Z" />
    </svg>
  );

  /* client/src/components/VideoTile.jsx */
/* …imports & logic stay exactly the same… */

return (
  <div
    style={{
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
    }}
  >
    {/* ── my video ───────────────────────────── */}
    <div
      /* give the tile its own box so the button can’t poke out */
      style={{
        position: 'relative',
        width: 200,                // ⬅ explicit width matches video
        height: 150,               //   (or whatever your camera ratio is)
        borderRadius: 8,
        overflow: 'hidden',        // ⬅ keeps button inside the frame
        border: '2px solid #555',
      }}
    >
      <video
        ref={myVideo}
        muted
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* mic-toggle */}
      <button
        onClick={toggleMute}
        title={muted ? 'Unmute mic' : 'Mute mic'}
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          zIndex: 10,              // ⬅ always on top of video
          background: '#111',
          border: 'none',
          borderRadius: '50%',
          padding: 6,
          lineHeight: 0,
          color: muted ? '#f87171' : '#34d399',
          cursor: 'pointer',
        }}
      >
        {muted ? MicOffIcon : MicIcon}
      </button>
    </div>

    {/* ── remote video ───────────────────────── */}
    <div
      style={{
        width: 200,
        height: 150,
        borderRadius: 8,
        overflow: 'hidden',
        border: ready ? '2px solid #4caf50' : '2px dashed #888',
      }}
    >
      <video
        ref={remoteVid}
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  </div>
);

}
