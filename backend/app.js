import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import mongoose from 'mongoose'
import compression from 'compression'
import { apiLimiter } from './middleware/rateLimitMiddleware.js'
import { errorHandler } from './utils/errorHandler.js'
import { requestLogger } from './utils/logger.js'
import authRoutes from './routes/authRoutes.js'
import lessonRoutes from './routes/lessonRoutes.js'
import quizRoutes from './routes/quizRoutes.js'
import questionRoutes from './routes/questionRoute.js'
import progressRoutes from './routes/progressRoutes.js'
import chatbotRoute from './routes/chatbotRoute.js';
import userRoutes from './routes/userRoutes.js';

const app = express()

// Enable compression for all responses
app.use(compression())

// Security middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.MONGO_URI || 'mongodb://localhost:27017'],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
}))
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Request parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
app.use(morgan('dev'))
app.use(requestLogger)

// Apply general API rate limiting
app.use('/api/', apiLimiter)
// Removed global auth rate limiter - now applied per-route in authRoutes.js

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/questions', questionRoutes) 
app.use('/api/progress', progressRoutes)
// Chatbot route (AI chat)
app.use('/api/chat', chatbotRoute);
app.use('/api/user', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'MongoDB'
  })
})

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`
  })
})

// Global error handling middleware
app.use(errorHandler)

export default app