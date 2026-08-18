const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', passport.authenticate('local'), authController.login);

// Logout route
router.post('/logout', authController.logout);

// Get user route
router.get('/user', ensureAuthenticated, authController.getUser);

router.get('/health', authController.health);

module.exports = router;