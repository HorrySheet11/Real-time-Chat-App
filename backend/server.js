const app = require('express')();
const http = require('node:http').createServer(app);
const PORT = process.env.PORT || 3000;
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

io.on('connection', (socket) => {
  console.log('new client connected!');
  socket.emit('connected', socket.id);
})