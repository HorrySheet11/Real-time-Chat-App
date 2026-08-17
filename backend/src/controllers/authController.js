const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Register a new user
exports.register = async (req, res) => {
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
};

// Login user
exports.login = (req, res) => {
  // This will be handled by passport.authenticate middleware
  // We'll just return the user after successful authentication
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const safeUser = {
    _id: req.user._id,
    username: req.user.username
  };
  res.json({ message: 'Logged in successfully', user: safeUser });
};

// Logout user
exports.logout = (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out' });
  });
};

// Get current user
exports.getUser = (req, res) => {
  if (req.isAuthenticated()) {
    const safeUser = {
      _id: req.user._id,
      username: req.user.username
    };
    res.json({ user: safeUser });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};