import express from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { 
  getLessonProgress,  // Updated function name
  getUserProgress,    // Updated function name
  updateProgress,
  resetProgress,      // Updated function name
  getProgressStatistics, // Updated function name
  getDetailedUserProgress,
  getDashboardData
} from '../controllers/progressController.js';

const router = express.Router();

// Get comprehensive dashboard data (must come before /:lessonId)
router.get('/dashboard/data',
  optionalAuth,
  getDashboardData
);

// Get user progress statistics
router.get('/stats/user',
  optionalAuth,
  getProgressStatistics  // Updated function name
);

// Get detailed progress with lesson information
router.get('/detailed/user',
  optionalAuth,
  getDetailedUserProgress
);

// Get all progress for a user
router.get('/',
  optionalAuth,
  getUserProgress  // Updated function name
);

// Get progress for a specific lesson
router.get('/:lessonId',
  optionalAuth,
  getLessonProgress  // Updated function name
);

// Update progress for a lesson
router.put('/:lessonId',
  optionalAuth,
  updateProgress
);

// Delete progress for a lesson (requires authentication)
router.delete('/:lessonId',
  protect,
  resetProgress  // Updated function name
);

export default router;