import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_BASE, {
  autoConnect: false,
  transports: ["websocket"],
});

if (import.meta.env.DEV) {
  window.socket = socket;
}