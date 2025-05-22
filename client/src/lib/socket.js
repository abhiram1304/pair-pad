import { io } from 'socket.io-client'; 

// client/src/lib/socket.js
export const socket = io('http://localhost:3001', {
  autoConnect: false,
  transports: ['websocket'],
});

if (import.meta.env.DEV) {
  window.socket = socket;        // ✅ now available in console
}
