import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addLessonQuestion,
  getRelatedLessonQuestions,
  getTopLessonQuestions
} from '../controllers/lessonQuestionController.js';

const router = express.Router();

// Add a new lesson question
router.post('/', protect, addLessonQuestion);

// Get related questions for a lesson
router.get('/related/:lessonId', protect, getRelatedLessonQuestions);

// Get top questions for a lesson (for FAQ section) - public route, no auth required
router.get('/top/:lessonId', getTopLessonQuestions);

export default router;
