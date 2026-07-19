const express = require('express');
const router = express.Router();
const {
  register, login, logout, getMe, updateProfile,
  changePassword, forgotPassword, resetPassword,
  updateNotificationPreferences,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  loginValidator, registerValidator, forgotPasswordValidator,
  resetPasswordValidator, changePasswordValidator,
} = require('../validators/authValidators');

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, forgotPassword);
router.put('/reset-password/:token', resetPasswordValidator, resetPassword);

// Protected routes
router.use(protect);
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/update-profile', upload.single('avatar'), updateProfile);
router.put('/change-password', changePasswordValidator, changePassword);
router.put('/notifications/preferences', updateNotificationPreferences);

module.exports = router;
