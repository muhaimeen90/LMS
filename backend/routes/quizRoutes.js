import express from 'express';
import {
  createQuiz,
  getQuizByLesson,
  submitQuizAttempt,
  getStudentAttempts,
  getStudentQuizStats,
  getAllQuizzes,
  getQuizById
} from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';
import { teacherOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.route('/')
  .get(getAllQuizzes)
  .post(protect, teacherOnly, createQuiz);

// Public route to get quiz by lesson - this needs to come BEFORE the /:id route
router.route('/lesson/:lessonId')
  .get(getQuizByLesson);

// Quiz by ID route
router.route('/:id')
  .get(getQuizById);

// Student routes
router.route('/attempt')
  .post(protect, submitQuizAttempt);

router.route('/attempts/:lessonId')
  .get(protect, getStudentAttempts);

router.route('/stats')
  .get(protect, getStudentQuizStats);

export default router;