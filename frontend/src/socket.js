// src/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  autoConnect: false, // We'll manually connect in App.jsx
  withCredentials: true,
  transports: ['websocket'] // Force WebSocket transport
});

export default socket;