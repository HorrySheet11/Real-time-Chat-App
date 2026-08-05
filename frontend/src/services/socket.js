import { io } from 'socket.io-client';

const backend = import.meta.env.BACKEND_URL || "http://localhost:3000";
export const socket = io(backend, { autoConnect: true }); 
