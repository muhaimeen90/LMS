import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getUserProgressOverview } from '../controllers/userController.js';

const router = express.Router();

// Get user progress overview (XP, level, badges, streak, lesson & quiz progress)
router.get('/progress', protect, getUserProgressOverview);

export default router;
