// Custom error class for API errors
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    Error.captureStackTrace(this, this.constructor)
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    })
  } else {
    // Production error response
    if (err.isOperational) {
      // Operational, trusted error: send message to client
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      })
    } else {
      // Programming or other unknown error: don't leak error details
      console.error('ERROR 💥', err)
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      })
    }
  }
}

// Async error handler wrapper
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}