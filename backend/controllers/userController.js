import User from '../models/userModel.js';
import { ApiError, catchAsync } from '../utils/errorHandler.js';
import { getDetailedProgress } from '../models/progressModel.js'; // Import getDetailedProgress

/**
 * GET /api/user/progress
 * Returns user's lesson and quiz progress, XP, level, badges, and streak,
 * and detailed progress for all lessons.
 */
export const getUserProgressOverview = catchAsync(async (req, res) => {
  const userId = req.user?.userId || req.user?.id;
  console.log('[getUserProgressOverview] User ID from req.user:', userId); // Log userId

  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const user = await User.findOne({ id: userId })
    .select('completedLessons quizAttempts totalXP level badges loginStreak email fullname')
    .lean();
  console.log('[getUserProgressOverview] User data from User.findOne:', JSON.stringify(user, null, 2)); // Log user data

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Fetch detailed progress for all lessons (completed and in-progress)
  const detailedProgress = await getDetailedProgress(userId);
  console.log('[getUserProgressOverview] Detailed progress from getDetailedProgress:', JSON.stringify(detailedProgress, null, 2)); // Log detailedProgress

  res.status(200).json({
    status: 'success',
    data: {
      ...user, // Spread the existing user data (completedLessons, quizAttempts, XP, etc.)
      detailedProgress, // Add the array of all progress entries with lesson details
    }
  });
});
