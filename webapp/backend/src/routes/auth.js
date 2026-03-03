const express = require('express');
const authService = require('../services/authService');
const userService = require('../services/userService');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { AuthenticationError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

const router = express.Router();

// Google OAuth callback
router.post('/google/callback', async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new AuthenticationError('Missing authorization code');
    }

    const { user, tokens } = await authService.handleGoogleCallback(code);

    res.json({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// Refresh access token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AuthenticationError('Missing refresh token');
    }

    const { accessToken } = await authService.refreshAccessToken(refreshToken);

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.userId);

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Logout - invalidate refresh token
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Admin: Get all users
router.get('/admin/users', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Admin: Set user as admin
router.post('/admin/users/:userId/promote', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!req.params.userId || req.params.userId.length === 0) {
      throw new ValidationError('Invalid user ID');
    }

    const user = await userService.setUserAsAdmin(req.params.userId);

    logger.info('User promoted to admin', {
      targetUserId: req.params.userId,
      changedBy: req.user.userId,
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Admin: Remove user from admin
router.post('/admin/users/:userId/demote', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!req.params.userId || req.params.userId.length === 0) {
      throw new ValidationError('Invalid user ID');
    }

    const user = await userService.removeAdminFromUser(req.params.userId);

    logger.info('User removed from admin', {
      targetUserId: req.params.userId,
      changedBy: req.user.userId,
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
