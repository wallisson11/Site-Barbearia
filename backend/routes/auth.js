const express = require('express');
const { register, login, getMe, logout, confirmEmail } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.get('/confirmar-email/:token', confirmEmail);

module.exports = router;
