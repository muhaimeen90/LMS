import express from 'express'
import { protect, restrictTo } from '../middleware/authMiddleware.js'
import { validate, createQuizValidation, quizSubmissionValidation } from '../middleware/validationMiddleware.js'
import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  getQuizStats
} from '../controllers/quizController.js'

const router = express.Router()

// Public quiz access routes
router.get('/', getAllQuizzes)
router.get('/:id', getQuizById)

// Quiz management routes - restricted to teachers and admins
router.post('/', protect, restrictTo('teacher', 'admin'), validate(createQuizValidation), createQuiz)
router.put('/:id', protect, restrictTo('teacher', 'admin'), validate(createQuizValidation), updateQuiz)
router.delete('/:id', protect, restrictTo('teacher', 'admin'), deleteQuiz)

// Quiz attempt routes - available to authenticated students
router.post('/:quizId/submit', protect, validate(quizSubmissionValidation), submitQuizAttempt)

// Quiz statistics - restricted to teachers and admins
router.get('/:id/stats', protect, restrictTo('teacher', 'admin'), getQuizStats)

export default router