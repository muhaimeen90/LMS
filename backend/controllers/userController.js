import User from '../models/userModel.js';
import { ApiError, catchAsync } from '../utils/errorHandler.js';

/**
 * GET /api/user/progress
 * Returns user's lesson and quiz progress, XP, level, badges, and streak
 */
export const getUserProgressOverview = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const user = await User.findById(userId)
    .select('completedLessons quizAttempts totalXP level badges loginStreak')
    .lean();

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    status: 'success',
    data: user
  });
});
