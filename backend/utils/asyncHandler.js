// filepath: /home/toha/Desktop/contest/LMS/backend/utils/asyncHandler.js

/**
 * Wraps an async Express route handler to properly catch and forward errors
 * This eliminates the need for try/catch blocks in each controller
 * 
 * @param {Function} fn - Async Express route handler
 * @returns {Function} - Express middleware function with error handling
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};