import express from 'express'
import { protect, restrictTo } from '../middleware/authMiddleware.js'
import { validate, createLessonValidation } from '../middleware/validationMiddleware.js'
import {
  getAllLessons,
  getLessonById,
  createLesson,
  deleteLesson
} from '../controllers/lessonController.js'
import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router()

// Public routes - anyone can view lessons
router.get('/', getAllLessons)
router.get('/:id', getLessonById)

// Protected routes - only teachers and admins can create or delete lessons
router.post('/', protect, restrictTo('teacher', 'admin'), upload.single('material'), validate(createLessonValidation), createLesson)
router.delete('/:id', protect, restrictTo('teacher', 'admin'), deleteLesson)

export default router