const io = require('socket.io-client');

// Replace 'http://localhost:3000' with the correct WebSocket URL if your app is running on a different domain or port.
const socketUrl = 'http://localhost:3000';

const socket = io.connect(socketUrl, {
  transports: ['websocket'], // Force WebSocket transport only
});

socket.on('connect', () => {
  console.log('Socket.IO Client Connected');
});

socket.on('message', (data) => {
  console.log('Received message:', data);
});
