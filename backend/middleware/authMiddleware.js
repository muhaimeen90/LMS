import jwt from 'jsonwebtoken';
import { getUserById, isConnected } from '../models/userModel.js';
import logger from '../utils/logger.js';

// JWT secret from environment or default
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Development fallback user (same as in authController.js)
const devModeUser = {
  id: 'dev-user-id',
  email: 'dev@example.com',
  fullname: 'Development User',
  role: 'admin',
  status: 'active',
};

/**
 * Middleware to protect routes that require authentication
 */
export const protect = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    
    if (!authorization || !authorization.startsWith('Bearer')) {
      return res.status(401).json({ error: 'Not authorized, no token provided' });
    }

    const token = authorization.split(' ')[1];
    
    // Verify JWT token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (!decoded || !decoded.id) {
        return res.status(401).json({ error: 'Not authorized, invalid token' });
      }

      // Development fallback mode
      if (isDevelopment && !isConnected()) {
        logger.warn('Using development mode fallback in auth middleware');
        // For development, we'll simply attach the dev user to the request
        if (decoded.id === devModeUser.id) {
          req.user = devModeUser;
          return next();
        }
      }

      // Get user from database
      const user = await getUserById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };
      
      next();
    } catch (jwtError) {
      logger.error(`JWT verification failed: ${jwtError.message}`);
      return res.status(401).json({ error: 'Not authorized, token invalid or expired' });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    res.status(401).json({ error: 'Not authorized, server error' });
  }
};

/**
 * Middleware to restrict access based on user roles
 * @param {...string} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      // Check if user has any of the required roles
      if (roles.includes(req.user.role)) {
        return next();
      }
      
      return res.status(403).json({ 
        error: 'Not authorized to perform this action' 
      });
    } catch (error) {
      logger.error(`Role check error: ${error.message}`);
      res.status(500).json({ error: 'Error checking user permissions' });
    }
  };
};

/**
 * Middleware that allows both authenticated and anonymous users,
 * but adds user data to request if authenticated
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    
    if (!authorization || !authorization.startsWith('Bearer')) {
      // No token, continue as anonymous
      req.user = null;
      return next();
    }

    const token = authorization.split(' ')[1];
    
    // Verify JWT token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (!decoded || !decoded.id) {  // Changed from userId to id
        req.user = null;
        return next();
      }

      // Get user from database
      const user = await getUserById(decoded.id);
      
      if (!user) {
        req.user = null;
        return next();
      }
      
      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };
    } catch (jwtError) {
      // Invalid token, continue as anonymous
      logger.warn(`Optional JWT verification failed: ${jwtError.message}`);
      req.user = null;
    }
    
    next();
  } catch (error) {
    logger.error(`Optional auth middleware error: ${error.message}`);
    // On error, continue as anonymous
    req.user = null;
    next();
  }
};