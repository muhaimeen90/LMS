import { body, param, validationResult } from 'express-validator'
import ApiError from '../utils/apiError.js'

// Common validation middleware
export const validate = (validations) => {
    return async (req, res, next) => {
      try {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)))
  
        const errors = validationResult(req)
        if (errors.isEmpty()) {
          return next()
        }
  
        // Format validation errors
        const details = {}
        errors.array().forEach(error => {
          details[error.path] = error.msg
        })
        
        throw new ApiError(400, 'Validation Error', details)
      } catch (error) {
        next(error)
      }
    }
  }

// export const handleAsyncValidation = (validations) => {
//   return async (req, res, next) => {
//     try {
//       await Promise.all(validations.map(validation => validation.run(req)))
//       validate(req, res, next)
//     } catch (error) {
//       next(new ApiError(400, 'Validation Error'))
//     }
//   }
// }

// Auth validations
export const signupValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
]

// Lesson validations
export const createLessonValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long'),
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['video', 'text', 'interactive'])
    .withMessage('Type must be either video, text, or interactive'),
  body('difficulty')
    .trim()
    .notEmpty()
    .withMessage('Difficulty is required')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be either beginner, intermediate, or advanced')
]

// Quiz validations
export const createQuizValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('lessonId')
    .notEmpty()
    .withMessage('Lesson ID is required'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  body('questions.*.text')
    .trim()
    .notEmpty()
    .withMessage('Question text is required')
    .isLength({ min: 3 })
    .withMessage('Question text must be at least 3 characters long'),
  body('questions.*.options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Each question must have between 2 and 6 options'),
  body('questions.*.options.*')
    .trim()
    .notEmpty()
    .withMessage('Option text cannot be empty'),
  body('questions.*.correct_answer')
    .trim()
    .notEmpty()
    .withMessage('Correct answer is required')
    .custom((value, { req }) => {
      const question = req.body.questions[Number(req.path.split('.')[1])]
      if (!question.options.includes(value)) {
        throw new Error('Correct answer must be one of the provided options')
      }
      return true
    })
]

export const quizSubmissionValidation = [
  param('quizId')
    .notEmpty()
    .withMessage('Quiz ID is required'),
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  body('answers.*.questionId')
    .notEmpty()
    .withMessage('Question ID is required for each answer'),
  body('answers.*.selectedAnswer')
    .trim()
    .notEmpty()
    .withMessage('Selected answer is required for each question')
]