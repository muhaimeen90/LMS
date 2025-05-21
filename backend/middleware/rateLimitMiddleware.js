import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const isDevelopment = process.env.NODE_ENV === 'development'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// More strict limiter for login/signup endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 100 : 10, // Higher limit in development mode
  message: {
    error: 'Too many login attempts from this IP, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    console.log(`Current NODE_ENV: ${process.env.NODE_ENV}`); // Debug log
    return isDevelopment || process.env.NODE_ENV === 'test';
  }
})

// Less restrictive limiter for /me and general auth verification endpoints
export const authVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60, // Allow 60 requests per 5 minutes (1 per 5 seconds on average)
  message: {
    error: 'Too many authentication verification requests, please try again shortly'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip when testing or in development
  skip: (req) => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'
})