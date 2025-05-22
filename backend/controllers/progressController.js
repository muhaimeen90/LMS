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
import User from '../models/userModel.js';
import logger from '../utils/logger.js'; // Added logger import

/**
 * Get progress for a specific lesson
 */
export const getLessonProgress = catchAsync(async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user?.id || req.user?._id || req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'User not authenticated or user ID not found');
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
  const userId = req.user?.id || req.user?._id || req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'User not authenticated or user ID not found');
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
  const { completed, timeSpent } = req.body; // timeSpent is the additional time for this session
  const userId = req.user?.id || req.user?._id || req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'User not authenticated or user ID not found');
  }
  logger.info(`updateProgress called for userId: ${userId}, lessonId: ${lessonId}, completed: ${completed}, timeSpent: ${timeSpent}`);


  // Check if lesson exists
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  // Get existing progress to properly update time spent
  const existingProgress = await getProgress(userId, lessonId);
  
  // Calculate new time spent
  const newTotalTimeSpent = (existingProgress?.time_spent || 0) + (timeSpent || 0);

  const progressUpdateData = {
    completed: completed !== undefined ? completed : existingProgress?.completed,
    time_spent: newTotalTimeSpent,
    last_accessed: new Date(),
  };
  if (completed && !(existingProgress?.completed)) { // If marking as completed now
    progressUpdateData.completed_at = new Date();
  } else if (completed === false) { // If un-marking completion
    progressUpdateData.completed_at = null;
  }


  const progress = await upsertProgress(userId, lessonId, progressUpdateData);

  if (completed) {
    const completedEntry = {
      lessonId,
      dateCompleted: progressUpdateData.completed_at || new Date(),
      timeSpentSec: newTotalTimeSpent,
    };
    logger.info(`Attempting to mark lesson ${lessonId} as completed for user ${userId}. Entry: ${JSON.stringify(completedEntry)}`);
    
    // Use a single atomic operation to remove existing entry and add new one
    await User.findOneAndUpdate(
      { id: userId },
      { 
        $pull: { completedLessons: { lessonId: lessonId } }
      },
      { new: true }
    );
    
    // Add the new entry after removal is complete
    await User.findOneAndUpdate(
      { id: userId },
      { 
        $push: { completedLessons: completedEntry }
      },
      { new: true, upsert: true }
    );
    
    const updatedUser = await User.findOne({ id: userId }).select('completedLessons');
    logger.info(`User ${userId} completedLessons after marking lesson ${lessonId} as completed: ${JSON.stringify(updatedUser?.completedLessons)}`);
  } else if (completed === false) {
    logger.info(`Attempting to mark lesson ${lessonId} as NOT completed for user ${userId}.`);
    // If explicitly marked as not completed, remove from completedLessons array
    await User.findOneAndUpdate(
      { id: userId },
      { $pull: { completedLessons: { lessonId: lessonId } } },
      { new: true }
    );
    const updatedUser = await User.findOne({ id: userId }).select('completedLessons');
    logger.info(`User ${userId} completedLessons after marking lesson ${lessonId} as NOT completed: ${JSON.stringify(updatedUser?.completedLessons)}`);
  }

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
  const userId = req.user?.id || req.user?._id || req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'User not authenticated or user ID not found');
  }
  logger.info(`completeLesson called for userId: ${userId}, lessonId: ${lessonId}`);

  // Check if lesson exists
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }
  
  const existingProgress = await getProgress(userId, lessonId);
  const totalTimeSpent = existingProgress?.time_spent || 0; // Use existing total time spent

  const progress = await upsertProgress(userId, lessonId, { 
    completed: true, 
    completed_at: new Date(),
    last_accessed: new Date()
    // time_spent is not updated here, assuming it's tracked by updateProgress
  });
  
  const completedEntry = {
    lessonId,
    dateCompleted: new Date(),
    timeSpentSec: totalTimeSpent, // Use the total time spent up to this point
  };

  logger.info(`Attempting to complete lesson ${lessonId} for user ${userId}. Entry: ${JSON.stringify(completedEntry)}`);
  
  // Use a single atomic operation to remove existing entry and add new one
  await User.findOneAndUpdate(
    { id: userId },
    { $pull: { completedLessons: { lessonId: lessonId } } },
    { new: true }
  );
  
  // Add the new entry after removal is complete
  await User.findOneAndUpdate(
    { id: userId },
    { $push: { completedLessons: completedEntry } },
    { new: true, upsert: true }
  );
  
  const updatedUser = await User.findOne({ id: userId }).select('completedLessons');
  logger.info(`User ${userId} completedLessons after completeLesson for lesson ${lessonId}: ${JSON.stringify(updatedUser?.completedLessons)}`);
  
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
  const userId = req.user?.id || req.user?._id || req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'User not authenticated or user ID not found');
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
  const userId = req.user?.id || req.user?._id || req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'User not authenticated or user ID not found');
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
  const userId = req.user?.id || req.user?._id || req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'User not authenticated or user ID not found');
  }

  const detailedProgress = await getDetailedProgress(userId);

  res.status(200).json({
    status: 'success',
    results: detailedProgress.length,
    data: detailedProgress
  });
});

/**
 * Get comprehensive dashboard data for the current user
 */
export const getDashboardData = catchAsync(async (req, res) => {
  const userId = req.user?.id || req.user?._id || req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'User not authenticated or user ID not found');
  }

  try {
    // Get user data with quiz attempts and completed lessons
    const user = await User.findOne({ id: userId }).select('completedLessons quizAttempts totalXP level badges loginStreak');
    
    // Get detailed progress with lesson information
    const detailedProgress = await getDetailedProgress(userId);
    console.log('Detailed progress data:', JSON.stringify(detailedProgress, null, 2));
    
    // Separate ongoing and completed lessons from progress
    const ongoingLessons = [];
    const completedLessonsFromProgress = [];
    
    detailedProgress.forEach(progress => {
      console.log('Processing progress entry:', {
        lesson_id: progress.lesson_id,
        lesson: progress.lesson,
        lessonTitle: progress.lesson?.title,
        lessonDescription: progress.lesson?.description
      });
      
      const lessonData = {
        lessonId: progress.lesson_id,
        title: progress.lesson?.title || 'Unknown Lesson',
        description: progress.lesson?.description || '',
        type: progress.lesson?.type || '',
        difficulty: progress.lesson?.difficulty || '',
        timeSpent: progress.time_spent || 0,
        lastAccessed: progress.last_accessed,
        completed: progress.completed,
        completedAt: progress.completed_at,
        startedAt: progress.started_at
      };
      
      if (progress.completed) {
        completedLessonsFromProgress.push(lessonData);
      } else {
        ongoingLessons.push(lessonData);
      }
    });

    // Get quiz attempts with lesson titles
    const enhancedQuizAttempts = [];
    if (user?.quizAttempts?.length > 0) {
      for (const attempt of user.quizAttempts) {
        let lessonTitle = 'Unknown Lesson';
        if (attempt.lessonId) {
          // Try to find lesson title from detailed progress first
          const progressEntry = detailedProgress.find(p => p.lesson_id === attempt.lessonId);
          if (progressEntry?.lesson?.title) {
            lessonTitle = progressEntry.lesson.title;
          } else {
            // Fallback: fetch lesson directly
            try {
              const lesson = await getLessonById(attempt.lessonId);
              if (lesson?.title) {
                lessonTitle = lesson.title;
              }
            } catch (error) {
              logger.warn(`Could not fetch lesson ${attempt.lessonId} for quiz attempt: ${error.message}`);
            }
          }
        }
        
        enhancedQuizAttempts.push({
          ...attempt.toObject(),
          lessonTitle,
          quizTitle: `Quiz for ${lessonTitle}`
        });
      }
    }

    // Combine completed lessons from user model and progress (user model takes precedence)
    const completedLessonsWithTitles = [];
    if (user?.completedLessons?.length > 0) {
      for (const completed of user.completedLessons) {
        let lessonTitle = 'Unknown Lesson';
        // Try to find lesson title from detailed progress first
        const progressEntry = detailedProgress.find(p => p.lesson_id === completed.lessonId);
        if (progressEntry?.lesson?.title) {
          lessonTitle = progressEntry.lesson.title;
        } else {
          // Fallback: fetch lesson directly
          try {
            const lesson = await getLessonById(completed.lessonId);
            if (lesson?.title) {
              lessonTitle = lesson.title;
            }
          } catch (error) {
            logger.warn(`Could not fetch lesson ${completed.lessonId}: ${error.message}`);
          }
        }
        
        completedLessonsWithTitles.push({
          ...completed.toObject(),
          title: lessonTitle
        });
      }
    }

    // Get progress statistics
    const stats = await getProgressStats(userId);

    const dashboardData = {
      user: {
        totalXP: user?.totalXP || 0,
        level: user?.level || 1,
        badges: user?.badges || [],
        loginStreak: user?.loginStreak || 0
      },
      ongoingLessons: ongoingLessons.sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed)),
      completedLessons: completedLessonsWithTitles.sort((a, b) => new Date(b.dateCompleted) - new Date(a.dateCompleted)),
      quizAttempts: enhancedQuizAttempts
        .sort((a, b) => new Date(b.dateTaken) - new Date(a.dateTaken))
        .slice(0, 10), // Limit to 10 most recent
      statistics: stats,
      detailedProgress
    };

    console.log('Final dashboard data ongoingLessons:', JSON.stringify(dashboardData.ongoingLessons, null, 2));

    res.status(200).json({
      status: 'success',
      data: dashboardData
    });
  } catch (error) {
    logger.error(`Error getting dashboard data: ${error.message}`);
    throw new ApiError(500, 'Failed to fetch dashboard data');
  }
});