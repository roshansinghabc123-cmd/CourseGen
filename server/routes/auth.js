const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');

const router = express.Router();

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
    message: 'User profile retrieved successfully'
  });
});

/**
 * @desc    Verify token
 * @route   GET /api/auth/verify
 * @access  Private
 */
const verifyToken = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      isValid: true,
      user: req.user
    },
    message: 'Token is valid'
  });
});

/**
 * @desc    Get authentication status
 * @route   GET /api/auth/status
 * @access  Public
 */
const getAuthStatus = asyncHandler(async (req, res) => {
  const authConfig = {
    domain: process.env.AUTH0_ISSUER,
    audience: process.env.AUTH0_AUDIENCE,
    configured: !!(process.env.AUTH0_ISSUER && process.env.AUTH0_AUDIENCE)
  };

  res.json({
    success: true,
    data: {
      authConfigured: authConfig.configured,
      domain: authConfig.domain ? authConfig.domain.replace('https://', '').replace('/', '') : null,
      audience: authConfig.audience
    }
  });
});

// Route definitions
router.get('/status', getAuthStatus);

// Protected routes
router.use(requireAuth);
router.get('/profile', getProfile);
router.get('/verify', verifyToken);

module.exports = router;
