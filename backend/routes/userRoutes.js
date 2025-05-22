import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getUserProgressOverview, updateUserProfile } from '../controllers/userController.js';

const router = express.Router();

// Get user progress overview (XP, level, badges, streak, lesson & quiz progress)
router.get('/progress', protect, getUserProgressOverview);

// Update user profile
router.put('/profile', protect, updateUserProfile);

export default router;
