// src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    if (!token) return;

    // Initialize socket with auth token
    const socketInstance = io('http://localhost:5004', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setConnected(false);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  // Methods for joining project rooms and handling events
  const joinProjectRoom = (projectId) => {
    if (socket && connected) {
      socket.emit('joinProject', projectId);
      console.log(`Joined project room: ${projectId}`);
    }
  };

  const leaveProjectRoom = (projectId) => {
    if (socket && connected) {
      socket.emit('leaveProject', projectId);
      console.log(`Left project room: ${projectId}`);
    }
  };

  // Context value
  const value = {
    socket,
    connected,
    joinProjectRoom,
    leaveProjectRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};