import jwt from 'jsonwebtoken'
import supabase from '../config/supabaseClient.js'
import { getCurrentUser, getUserRoles } from '../models/userModel.js'
import logger from '../utils/logger.js'

/**
 * Middleware to protect routes that require authentication
 */
export const protect = async (req, res, next) => {
  try {
    const { authorization } = req.headers
    
    if (!authorization || !authorization.startsWith('Bearer')) {
      return res.status(401).json({ error: 'Not authorized, no token provided' })
    }

    const token = authorization.split(' ')[1]
    
    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      logger.warn(`Authentication failed: ${error?.message || 'No user found'}`)
      return res.status(401).json({ error: 'Not authorized, invalid token' })
    }

    // Get the full user data including profile from our user model
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Set the session in the Supabase client for subsequent requests
      if (session) {
        supabase.auth.setSession(session)
      }
      
      // Get user's complete profile data
      const userData = await getCurrentUser()
      req.user = userData
      
      next()
    } catch (userError) {
      logger.error(`Error getting user data: ${userError.message}`)
      return res.status(401).json({ error: 'Not authorized, user data unavailable' })
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`)
    res.status(401).json({ error: 'Not authorized, server error' })
  }
}

/**
 * Middleware to restrict access based on user roles
 * @param {...string} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    
    try {
      // Get user's roles from the database
      const userRoles = await getUserRoles(req.user.id)
      
      // Check if user has any of the required roles
      const hasPermission = userRoles.some(userRole => 
        roles.includes(userRole.role)
      )
      
      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Not authorized to perform this action' 
        })
      }
      
      next()
    } catch (error) {
      logger.error(`Role check error: ${error.message}`)
      res.status(500).json({ error: 'Error checking user permissions' })
    }
  }
}

/**
 * Middleware that allows both authenticated and anonymous users,
 * but adds user data to request if authenticated
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers
    
    if (!authorization || !authorization.startsWith('Bearer')) {
      // No token, continue as anonymous
      req.user = null
      return next()
    }

    const token = authorization.split(' ')[1]
    
    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      // Invalid token, continue as anonymous
      req.user = null
      return next()
    }

    // Get full user data if token is valid
    try {
      const userData = await getCurrentUser()
      req.user = userData
    } catch (userError) {
      // Error getting user data, continue as anonymous
      logger.warn(`Error in optionalAuth: ${userError.message}`)
      req.user = null
    }
    
    next()
  } catch (error) {
    logger.error(`Optional auth middleware error: ${error.message}`)
    // On error, continue as anonymous
    req.user = null
    next()
  }
}