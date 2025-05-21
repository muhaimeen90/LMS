import app from './app.js'
import dotenv from 'dotenv'
import logger from './utils/logger.js'

dotenv.config()

const port = process.env.PORT || 3001
let server

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err)
  if (server) {
    server.close(() => {
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
})

server = app.listen(port, () => {
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