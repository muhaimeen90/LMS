import User from '../models/userModel.js';

// XP award rules
export const XP_VALUES = {
  lessonComplete: 10,
  quizPass: 15,
  quizPerfectBonus: 5,
  collaborate: 20,
  dailyLogin: 5
};

// XP thresholds for levels
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 800];

/**
 * Calculate level from total XP.
 */
export function getLevelFromXP(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Award XP for a specific action and update user record.
 * Optionally extra bonus XP.
 */
export async function awardXP(userId, actionKey, bonus = 0) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const baseXP = XP_VALUES[actionKey] || 0;
  const totalGain = baseXP + bonus;
  user.totalXP = (user.totalXP || 0) + totalGain;
  user.level = getLevelFromXP(user.totalXP);

  // Check for new badges
  const newBadges = [];
  // First Steps badge
  if (!user.badges.some(b => b.badgeId === 'first_steps')
      && user.completedLessons.length === 1) {
    newBadges.push({ badgeId: 'first_steps', name: 'First Steps', dateEarned: new Date() });
  }
  // Quiz Hero badge
  const perfectCount = user.quizAttempts.filter(q => q.score === q.maxScore).length;
  if (!user.badges.some(b => b.badgeId === 'quiz_hero') && perfectCount >= 5) {
    newBadges.push({ badgeId: 'quiz_hero', name: 'Quiz Hero', dateEarned: new Date() });
  }
  // Streak Master badge
  if (!user.badges.some(b => b.badgeId === 'streak_master')
      && user.loginStreak >= 5) {
    newBadges.push({ badgeId: 'streak_master', name: 'Streak Master', dateEarned: new Date() });
  }
  // Append new badges
  newBadges.forEach(b => user.badges.push(b));

  await user.save();
  return { totalXP: user.totalXP, level: user.level, newBadges };
}
