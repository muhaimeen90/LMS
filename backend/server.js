import app from './app.js'
import dotenv from 'dotenv'
import logger from './utils/logger.js'
import { connectToMongoDB } from './config/mongoClient.js'

dotenv.config()

// Function to start the server
const startServer = () => {
  const port = process.env.PORT || 3001
  const server = app.listen(port, () => {
    logger.info(`Server is running on port ${port}`)
  })

  const shutdown = () => {
    logger.info('Received shutdown signal. Closing server...')
    server.close(() => {
      logger.info('Server closed')
      process.exit(0)
    })

    // Force close after 10s
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down')
      process.exit(1)
    }, 10000)
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

// Try to connect to MongoDB, but fall back to starting without it if there's a connection issue
connectToMongoDB()
  .then(() => {
    startServer()
  })
  .catch(err => {
    logger.error('Failed to connect to MongoDB:', err)
    logger.warn('Starting server without MongoDB connection. Some features may not work properly.')
    startServer() // Still start the server even if MongoDB connection fails
  })

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err)
  process.exit(1)
})