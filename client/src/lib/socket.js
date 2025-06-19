/* client/src/lib/socket.js */
import { io } from 'socket.io-client';

/* -- use secure WebSocket when served over https -- */
export const socket = io(import.meta.env.VITE_API_BASE, {
  autoConnect: false,
  transports : ['websocket'],
  secure     : location.protocol === 'https:',
});

if (import.meta.env.DEV) window.socket = socket;
