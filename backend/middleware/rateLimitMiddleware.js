import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// More reliable environment detection
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
console.log(`Environment mode: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Higher limit in development
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development mode
  skip: (req) => isDevelopment
})

// More strict limiter for login/signup endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 1000 : 20, // Much higher limit in development, slightly increased in production
  message: {
    error: 'Too many login attempts from this IP, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development mode
  skip: (req) => isDevelopment || process.env.NODE_ENV === 'test'
})

// Less restrictive limiter for /me and general auth verification endpoints
export const authVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: isDevelopment ? 1000 : 60, // Higher limit in development
  message: {
    error: 'Too many authentication verification requests, please try again shortly'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development mode
  skip: (req) => isDevelopment || process.env.NODE_ENV === 'test'
})