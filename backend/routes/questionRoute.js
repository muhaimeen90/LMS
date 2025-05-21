import express from 'express';
import {
  getAllQuestions,
  getQuestionById,
  addQuestion,
  deleteQuestion,
  getTopQuestions
} from '../controllers/questionController.js';

const router = express.Router();

// Get all questions
router.get('/', getAllQuestions);

// Get top questions by count
router.get('/top', getTopQuestions);

// Get question by ID
router.get('/:id', getQuestionById);
router.post('/add', addQuestion);

// Process new question (check similarity, store if unique)

// Delete question
router.delete('/:id', deleteQuestion);

export default router;