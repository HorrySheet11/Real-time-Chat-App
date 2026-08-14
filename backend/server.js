const express = require("express");
const app = express();
//TODO: cors error
const cors = require("cors");
const server = require("node:http").createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "http://localhost:5173" },
});
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo").MongoStore;
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
require("dotenv").config();

mongoose.connect(`${process.env.MONGO_URL}/try`);

const store = MongoStore.create({ mongoUrl: `${process.env.MONGO_URL}/try` });

const chatSchema = mongoose.Schema({
  message: String,
  sender: String,
  timestamp: { type: Date, default: Date.now },
});

// Cache for models per collection
const modelCache = new Map();

function getModel(collectionName) {
  if (!modelCache.has(collectionName)) {
    modelCache.set(collectionName, mongoose.connection.model(collectionName, chatSchema));
  }
  return modelCache.get(collectionName);
}

// User model
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  password: { type: String, required: true, minlength: 6 }
}));

// Passport configuration
passport.use(new LocalStrategy(
  { usernameField: 'username' },
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    const safeUser = {
      _id: user._id,
      username: user.username
    };
    res.status(201).json({ message: 'User registered successfully', user: safeUser });
    console.log(`User registered: ${user.username}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', passport.authenticate('local'), (req, res) => {
  const safeUser = {
    _id: req.user._id,
    username: req.user.username
  };
  res.json({ message: 'Logged in successfully', user: safeUser });
  console.log(`User logged in: ${req.user.username}`);
});

app.post('/api/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out' });
  });
});

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    const safeUser = {
      _id: req.user._id,
      username: req.user.username
    };
    res.json({ user: safeUser });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Socket.io authentication middleware
io.use((socket, next) => {
  // We'll try to get the session from the handshake
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

// We need to wrap the session middleware for use in io.use
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
});

io.use((socket, next) => {
  // We'll try to get the session from the handshake
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

io.on("connection", (socket) => {
  console.log("A user connected!");

  // Initialize current collection for this socket
  socket.currentCollection = null;

  // Attach user to socket from session (if authenticated)
  // We already set socket.userId in the middleware, but we can also fetch the user object
  // We'll fetch the user object from the database and attach to socket.user
  socket.user = null;
  if (socket.userId) {
    User.findById(socket.userId).select('username _id').then(user => {
      socket.user = user;
    }).catch(err => {
      console.error('Error fetching user:', err);
    });
  }

  socket.on("change_collection", async (group) => {
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
      socket.emit("messages", messages);
    } catch (err) {
      console.error(`Error fetching messages for ${group}:`, err);
      socket.emit("messages", []); // Send empty array on error
    }
  });

  socket.on("chat_message", async (msg) => {
    console.log(`message: ${msg}`);

    if (!socket.currentCollection) {
      console.warn("Received chat_message but no collection selected");
      return;
    }

    // Check if user is authenticated
    if (!socket.user) {
      console.warn("Unauthenticated user tried to send a message");
      return;
    }

    try {
      const Chat = getModel(socket.currentCollection);
      const newChat = new Chat({
        message: msg,
        sender: socket.user.username, // Use the authenticated user's username
      });
      await newChat.save();

      // Broadcast the message to everyone in the room
      const messages = await Chat.find();
      io.to(socket.currentCollection).emit("messages", messages);
    } catch (err) {
      console.error(`Error saving message to ${socket.currentCollection}:`, err);
    }
  });

  socket.on("get_messages", async () => {
    if (!socket.currentCollection) {
      console.warn("get_messages called but no collection selected");
      socket.emit("messages", []); // Send empty array
      return;
    }

    try {
      const Chat = getModel(socket.currentCollection);
      const messages = await Chat.find();
      socket.emit("messages", messages);
    } catch (err) {
      console.error(`Error fetching messages for ${socket.currentCollection}:`, err);
      socket.emit("messages", []); // Send empty array on error
    }
  });

  socket.on("get_collections", async () => {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      // Filter out the 'users' collection
      const filteredCollections = collections.filter(c => c.name !== 'users');
      socket.emit("collections", filteredCollections);
    } catch (err) {
      console.error("Error fetching collections:", err);
      socket.emit("collections", []); // Send empty array on error
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected!");
    // Rooms are left automatically on disconnect
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`listening on ${port}`);
});
