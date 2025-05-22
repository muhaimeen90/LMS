import express from 'express';
import {
  getAllQuestions,
  getQuestionById,
  addQuestion,
  deleteQuestion,
  getTopQuestions
} from '../controllers/questionController.js';
import {
  addLessonQuestion,
  getRelatedLessonQuestions
} from '../controllers/lessonQuestionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all questions
router.get('/', getAllQuestions);

// Get top questions by count
router.get('/top', getTopQuestions);

// Get question by ID
router.get('/:id', getQuestionById);
router.post('/', addQuestion);

// Process new question (check similarity, store if unique)

// Delete question
router.delete('/:id', deleteQuestion);

// New lesson-specific questions routes
router.post('/lesson', protect, addLessonQuestion);
router.get('/lesson/:lessonId', protect, getRelatedLessonQuestions);

export default router;