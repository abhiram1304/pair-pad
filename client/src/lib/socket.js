import { io } from 'socket.io-client';

// Points straight to backend; Vite proxy handles dev CORS
export const socket = io('http://localhost:3001', {
  autoConnect: false,               // we’ll connect manually per room
});
