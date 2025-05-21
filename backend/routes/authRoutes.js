import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserRoles,
  assignRoleToUser
} from '../controllers/authController.js';
import { protect, restrictTo, optionalAuth } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Public routes - with rate limiting
router.post('/register', authLimiter, register);
router.post('/signup', authLimiter, register); // Add signup endpoint as alias to match frontend request
router.post('/login', authLimiter, login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, changePassword);

// Admin routes
router.get('/users', protect, restrictTo('admin'), getAllUsers);
router.get('/users/:id', protect, restrictTo('admin'), getUserById);
router.put('/users/:id', protect, restrictTo('admin'), updateUser);
router.delete('/users/:id', protect, restrictTo('admin'), deleteUser);

// User roles management
router.get('/roles', protect, restrictTo('admin'), getUserRoles);
router.post('/users/:userId/roles/:roleId', protect, restrictTo('admin'), assignRoleToUser);

export default router;