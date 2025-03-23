import { Socket } from 'socket.io';

declare module 'socket.io' {
  interface Socket {
    user?: {
      _id: string;
      // Add other user properties as needed
    };
  }
}