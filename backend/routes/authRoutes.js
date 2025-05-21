import express from 'express'
import { 
  signup, 
  login, 
  logout, 
  getCurrentUser, 
  getUserRolesHandler, 
  getAllRolesHandler, 
  assignRoleHandler, 
  removeRoleHandler 
} from '../controllers/authController.js'
import { validate, signupValidation } from '../middleware/validationMiddleware.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'

const router = express.Router()

// Basic auth routes
router.post('/signup', validate(signupValidation), signup)
router.post('/login', validate(signupValidation), login)
router.post('/logout', logout)
router.get('/me', getCurrentUser)

// Role management routes - protected and restricted to admin role
router.get('/roles', protect, getAllRolesHandler)
router.get('/users/:userId/roles', protect, restrictTo('admin'), getUserRolesHandler)
router.post('/users/:userId/roles', protect, restrictTo('admin'), assignRoleHandler)
router.delete('/users/:userId/roles/:roleId', protect, restrictTo('admin'), removeRoleHandler)

export default router