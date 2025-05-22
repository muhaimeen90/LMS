import { ApiError, catchAsync } from '../utils/errorHandler.js';
import {
  getProgress,
  getAllUserProgress,
  upsertProgress,
  getProgressStats,
  getDetailedProgress,
  deleteProgress
} from '../models/progressModel.js';
import { getLessonById } from '../models/lessonModel.js';
import { awardXP } from '../utils/xpUtils.js';

/**
 * Get progress for a specific lesson
 */
export const getLessonProgress = catchAsync(async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'Authentication required for tracking progress');
  }

  // Check if lesson exists
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  const progress = await getProgress(userId, lessonId);

  res.status(200).json({
    status: 'success',
    data: progress || { 
      user_id: userId, 
      lesson_id: lessonId, 
      completed: false, 
      time_spent: 0 
    }
  });
});

/**
 * Get all progress for the current user
 */
export const getUserProgress = catchAsync(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'Authentication required for tracking progress');
  }

  const progress = await getAllUserProgress(userId);

  res.status(200).json({
    status: 'success',
    results: progress.length,
    data: progress
  });
});

/**
 * Update progress for a lesson
 */
export const updateProgress = catchAsync(async (req, res) => {
  const { lessonId } = req.params;
  const { completed, timeSpent } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'Authentication required for tracking progress');
  }

  // Check if lesson exists
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  // Get existing progress to properly update time spent
  const existingProgress = await getProgress(userId, lessonId);
  
  // Calculate new time spent
  const newTimeSpent = existingProgress 
    ? (existingProgress.time_spent || 0) + (timeSpent || 0)
    : (timeSpent || 0);

  // Update progress
  const progress = await upsertProgress(userId, lessonId, {
    completed: completed !== undefined ? completed : existingProgress?.completed,
    time_spent: newTimeSpent
  });

  res.status(200).json({
    status: 'success',
    data: progress
  });
});

/**
 * Mark a lesson as completed
 */
export const completeLesson = catchAsync(async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'Authentication required for tracking progress');
  }

  // Check if lesson exists
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  const progress = await upsertProgress(userId, lessonId, { completed: true });
  // Award XP for completing lesson
  const { totalXP, level, newBadges } = await awardXP(userId, 'lessonComplete');

  res.status(200).json({
    status: 'success',
    data: { progress, totalXP, level, newBadges }
  });
});

/**
 * Reset progress for a lesson
 */
export const resetProgress = catchAsync(async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'Authentication required for tracking progress');
  }

  // Check if the lesson exists
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  // Delete the progress record
  await deleteProgress(userId, lessonId);

  res.status(200).json({
    status: 'success',
    message: 'Progress reset successfully'
  });
});

/**
 * Get progress statistics for the current user
 */
export const getProgressStatistics = catchAsync(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'Authentication required for statistics');
  }

  const stats = await getProgressStats(userId);

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

/**
 * Get detailed progress with lesson information
 */
export const getDetailedUserProgress = catchAsync(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'Authentication required for detailed progress');
  }

  const detailedProgress = await getDetailedProgress(userId);

  res.status(200).json({
    status: 'success',
    results: detailedProgress.length,
    data: detailedProgress
  });
});