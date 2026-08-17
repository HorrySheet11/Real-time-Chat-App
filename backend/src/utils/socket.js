const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const mongoose = require('mongoose');
const User = require('../models/User');
const { getModel } = require('../models/Chat');

function setupSocket(httpServer, sessionStore) {
  const io = require('socket.io')(httpServer, {
    cors: { origin: 'http://localhost:5173' },
  });

  // Session middleware for socket.io
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  });

  io.use((socket, next) => {
    const req = socket.handshake;
    const res = {};
    sessionMiddleware(req, res, () => {
      // If the session is authenticated, we can attach the user to the socket
      if (req.session?.passport?.user) {
        socket.userId = req.session.passport.user;
        return next();
      }
      // If not authenticated, we can still allow connection but mark as unauthenticated
      // We'll handle authentication in the events.
      socket.userId = null;
      return next();
    });
  });

  io.on('connection', (socket) => {
    console.log('A user connected!');

    // Initialize current collection for this socket
    socket.currentCollection = null;

    // Attach user to socket from session (if authenticated)
    socket.user = null;
    if (socket.userId) {
      User.findById(socket.userId).select('username _id').then(user => {
        socket.user = user;
      }).catch(err => {
        console.error('Error fetching user:', err);
      });
    }

    socket.on('change_collection', async (group) => {
      console.log(`changed to ${group}`);

      // Leave the previous room if any
      if (socket.currentCollection) {
        socket.leave(socket.currentCollection);
        console.log(`left room ${socket.currentCollection}`);
      }

      // Join the new room
      socket.join(group);
      socket.currentCollection = group;
      console.log(`joined room ${group}`);

      // Fetch messages for this collection and send to this socket
      try {
        const Chat = getModel(group);
        const messages = await Chat.find();
        socket.emit('messages', messages);
      } catch (err) {
        console.error(`Error fetching messages for ${group}:`, err);
        socket.emit('messages', []); // Send empty array on error
      }
    });

    socket.on('chat_message', async (data) => {
      let msg;
      let senderUsername;

      // Handle both string and object formats for backward compatibility
      if (typeof data === 'string') {
        msg = data;
        senderUsername = socket.user?.username;
      } else if (data && typeof data === 'object' && data.message !== undefined) {
        msg = data.message;
        senderUsername = data.user?.username || socket.user?.username;
      } else {
        console.warn('Invalid chat_message format:', data);
        return;
      }

      console.log(`message: ${msg}`);

      if (!socket.currentCollection) {
        console.warn('Received chat_message but no collection selected');
        return;
      }

      // Check if user is authenticated (either from session or from data)
      if (!socket.user && !data.user) {
        console.warn('Unauthenticated user tried to send a message');
        return;
      }

      try {
        const Chat = getModel(socket.currentCollection);
        const newChat = new Chat({
          message: msg,
          sender: senderUsername, // Use the username from data or session
        });
        await newChat.save();

        // Broadcast the message to everyone in the room
        const messages = await Chat.find();
        io.to(socket.currentCollection).emit('messages', messages);
      } catch (err) {
        console.error(`Error saving message to ${socket.currentCollection}:`, err);
      }
    });

    socket.on('get_messages', async () => {
      if (!socket.currentCollection) {
        console.warn('get_messages called but no collection selected');
        socket.emit('messages', []); // Send empty array
        return;
      }

      try {
        const Chat = getModel(socket.currentCollection);
        const messages = await Chat.find();
        socket.emit('messages', messages);
      } catch (err) {
        console.error(`Error fetching messages for ${socket.currentCollection}:`, err);
        socket.emit('messages', []); // Send empty array on error
      }
    });

    socket.on('get_collections', async () => {
      try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        // Filter out the 'users' and 'sessions' collections
        const filteredCollections = collections.filter(c => c.name !== 'users' && c.name !== 'sessions');
        socket.emit('collections', filteredCollections);
      } catch (err) {
        console.error('Error fetching collections:', err);
        socket.emit('collections', []); // Send empty array on error
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected!');
      // Rooms are left automatically on disconnect
    });
  });

  return io;
}

module.exports = { setupSocket };