const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

const server = require("node:http").createServer(app);

const mongoose = require("mongoose");
mongoose.connect(`${process.env.MONGO_URL}/${process.env.DATABASE_NAME}`);

const session = require("express-session");
const MongoStore = require("connect-mongo").MongoStore;
const store = MongoStore.create({
  mongoUrl: `${process.env.MONGO_URL}/${process.env.DATABASE_NAME}`
});

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Import models
const User = require("./src/models/User");
const { getModel } = require("./src/models/Chat");

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

// Import routes
const authRoutes = require("./src/routes/authRoutes");
app.use("/api", authRoutes);

// Socket.io setup
const { setupSocket } = require("./src/utils/socket");
const io = setupSocket(server, store);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`listening on ${port}`);
});