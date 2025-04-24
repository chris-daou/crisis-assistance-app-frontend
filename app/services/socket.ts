// src/services/socket.ts
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env'; // Ensure you have the correct path to your .env file

const SOCKET_URL = `${BACKEND_URL}`;

class SocketService {
  private socket: Socket | null = null;

  // initialize connection (once)
  public async init() {
    if (this.socket?.connected) return this.socket;

    const userId = (await AsyncStorage.getItem('user'))?.replace(/"/g, '') || '';
    const token = (await AsyncStorage.getItem('token'))?.replace(/"/g, '') || '';

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
      query: { userId },
    });

    this.socket.on('connect', () => {
      console.log('Socket connected', this.socket?.id);
    });

    // automatic re-register on reconnect
    this.socket.on('reconnect', () => {
      this.socket?.emit('registerUser', userId);
    });

    return this.socket;
  }

  public on<T>(event: string, handler: (data: T) => void) {
    if (!this.socket) throw new Error('Socket not initialized');
    this.socket.on(event, handler);
  }

  public emit(event: string, payload?: any) {
    if (!this.socket) throw new Error('Socket not initialized');
    this.socket.emit(event, payload);
  }

  public disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export default new SocketService();
