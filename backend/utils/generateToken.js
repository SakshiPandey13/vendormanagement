const jwt = require('jsonwebtoken');

/**
 * Generate JWT and optionally attach to response header
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    data: userObj,
  });
};

module.exports = { generateToken, sendTokenResponse };
