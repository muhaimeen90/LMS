import User from '../models/userModel.js';
import logger from './logger.js';

// XP award rules - expanded for more activity types
export const XP_VALUES = {
  // Lesson related
  lessonComplete: 10,
  lessonStreak: 5,      // Completing lessons on consecutive days
  
  // Quiz related
  quizAttempt: 2,       // Just for attempting a quiz
  quizPass: 15,         // Successfully passing a quiz
  quizFail: 1,          // Small amount for failed attempts to encourage trying
  quizPerfectBonus: 5,  // Bonus for 100% score
  quizFirstTryBonus: 8, // Extra points for passing on first attempt
  quizTimeBonus: 3,     // Bonus for completing quickly (under par time)
  quizRetrySuccess: 10, // Successfully passing after previous failure
  
  // Social and engagement
  collaborate: 20,
  discussion: 5,        // Participating in discussions
  helpOthers: 10,       // Helping other students
  feedback: 3,          // Providing lesson feedback
  
  // Consistency
  dailyLogin: 5,
  weekStreak: 15,       // Week-long login streak
  monthStreak: 50       // Month-long login streak
};

// More granular level thresholds with exponential growth
// This makes early levels easier to achieve but higher levels require more effort
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  450,    // Level 4
  700,    // Level 5
  1000,   // Level 6
  1400,   // Level 7
  1900,   // Level 8
  2500,   // Level 9
  3200,   // Level 10
  4000,   // Level 11
  5000,   // Level 12
  6200,   // Level 13
  7500,   // Level 14
  9000,   // Level 15
  10500,  // Level 16
  12500,  // Level 17
  15000,  // Level 18
  18000,  // Level 19
  21000   // Level 20
];

// XP needed for next level
export function getXPForNextLevel(currentLevel) {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    // For levels beyond our defined thresholds, use a formula
    return Math.floor(LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * 1.2);
  }
  
  return LEVEL_THRESHOLDS[currentLevel] - LEVEL_THRESHOLDS[currentLevel - 1];
}

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
 * Calculate progress towards next level (0-100%)
 */
export function getLevelProgress(xp) {
  const currentLevel = getLevelFromXP(xp);
  
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    // For max level, always show 100%
    return 100;
  }
  
  const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
  const nextLevelThreshold = LEVEL_THRESHOLDS[currentLevel];
  
  const xpInCurrentLevel = xp - currentLevelThreshold;
  const xpNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;
  
  return Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100));
}

/**
 * Award XP for quiz attempt with intelligent bonus calculation
 */
export async function awardQuizXP(userId, quizData) {
  const { 
    passed, 
    score, 
    totalQuestions, 
    isFirstAttempt,
    timeTaken,
    parTime,
    previouslyFailed
  } = quizData;
  
  let totalXP = XP_VALUES.quizAttempt; // Base XP for attempting
  let xpBreakdown = { attempt: XP_VALUES.quizAttempt };
  
  // Handle passed quiz
  if (passed) {
    totalXP += XP_VALUES.quizPass;
    xpBreakdown.pass = XP_VALUES.quizPass;
    
    // Perfect score bonus
    if (score === totalQuestions) {
      totalXP += XP_VALUES.quizPerfectBonus;
      xpBreakdown.perfect = XP_VALUES.quizPerfectBonus;
    }
    
    // First attempt bonus
    if (isFirstAttempt) {
      totalXP += XP_VALUES.quizFirstTryBonus;
      xpBreakdown.firstTry = XP_VALUES.quizFirstTryBonus;
    }
    
    // Time bonus (if completed under par time)
    if (timeTaken && parTime && timeTaken < parTime) {
      totalXP += XP_VALUES.quizTimeBonus;
      xpBreakdown.time = XP_VALUES.quizTimeBonus;
    }
    
    // Retry success (succeeding after previous failure)
    if (previouslyFailed) {
      totalXP += XP_VALUES.quizRetrySuccess;
      xpBreakdown.retry = XP_VALUES.quizRetrySuccess;
    }
  } else {
    // Failed quiz still gets minimal XP
    totalXP += XP_VALUES.quizFail;
    xpBreakdown.fail = XP_VALUES.quizFail;
  }
  
  // Apply the XP
  try {
    const result = await awardXP(userId, 'quiz', totalXP);
    return { ...result, xpBreakdown };
  } catch (error) {
    logger.error(`Failed to award quiz XP: ${error.message}`);
    throw error;
  }
}

/**
 * Award XP for a specific action and update user record.
 * Optionally extra bonus XP.
 */
export async function awardXP(userId, actionKey, xpAmount = null) {
  try {
    const user = await User.findOne({ id: userId });
    if (!user) throw new Error(`User not found with id: ${userId}`);

    // If specific amount is provided, use it, otherwise look up the action
    const totalGain = xpAmount !== null ? xpAmount : (XP_VALUES[actionKey] || 0);
    
    if (totalGain <= 0) {
      return { 
        totalXP: user.totalXP || 0, 
        level: user.level || 1, 
        newBadges: [],
        xpGained: 0 
      };
    }
    
    // Update user's total XP
    user.totalXP = (user.totalXP || 0) + totalGain;
    
    // Calculate new level
    const oldLevel = user.level || 1;
    user.level = getLevelFromXP(user.totalXP);
    
    // Check for level-up
    const leveledUp = user.level > oldLevel;
    
    // Check for new badges
    const newBadges = await checkForNewBadges(user);
    
    // Save user with updates
    await user.save();
    
    return { 
      totalXP: user.totalXP, 
      level: user.level, 
      leveledUp,
      xpGained: totalGain,
      newBadges,
      progress: getLevelProgress(user.totalXP)
    };
  } catch (error) {
    logger.error(`Error in awardXP: ${error.message}`);
    throw error;
  }
}

/**
 * Check for and award new badges based on user's progress
 */
async function checkForNewBadges(user) {
  const newBadges = [];
  
  // Learning badges
  if (!hasBadge(user, 'first_steps') && hasCompletedLessons(user, 1)) {
    addBadge(newBadges, 'first_steps', 'First Steps', 'Completed your first lesson');
  }
  
  if (!hasBadge(user, 'knowledge_seeker') && hasCompletedLessons(user, 5)) {
    addBadge(newBadges, 'knowledge_seeker', 'Knowledge Seeker', 'Completed 5 lessons');
  }
  
  if (!hasBadge(user, 'learning_master') && hasCompletedLessons(user, 20)) {
    addBadge(newBadges, 'learning_master', 'Learning Master', 'Completed 20 lessons');
  }
  
  // Quiz badges
  const perfectQuizCount = countPerfectQuizzes(user);
  const quizPassCount = countPassedQuizzes(user);
  
  if (!hasBadge(user, 'quiz_novice') && quizPassCount >= 1) {
    addBadge(newBadges, 'quiz_novice', 'Quiz Novice', 'Passed your first quiz');
  }
  
  if (!hasBadge(user, 'quiz_adept') && quizPassCount >= 10) {
    addBadge(newBadges, 'quiz_adept', 'Quiz Adept', 'Passed 10 quizzes');
  }
  
  if (!hasBadge(user, 'quiz_hero') && perfectQuizCount >= 5) {
    addBadge(newBadges, 'quiz_hero', 'Quiz Hero', 'Earned perfect scores on 5 quizzes');
  }
  
  if (!hasBadge(user, 'quiz_master') && perfectQuizCount >= 15) {
    addBadge(newBadges, 'quiz_master', 'Quiz Master', 'Earned perfect scores on 15 quizzes');
  }
  
  // Consistency badges
  if (!hasBadge(user, 'streak_starter') && user.loginStreak >= 3) {
    addBadge(newBadges, 'streak_starter', 'Streak Starter', 'Logged in for 3 consecutive days');
  }
  
  if (!hasBadge(user, 'streak_master') && user.loginStreak >= 7) {
    addBadge(newBadges, 'streak_master', 'Streak Master', 'Logged in for 7 consecutive days');
  }
  
  if (!hasBadge(user, 'streak_champion') && user.loginStreak >= 30) {
    addBadge(newBadges, 'streak_champion', 'Streak Champion', 'Logged in for 30 consecutive days');
  }
  
  // Level-based badges
  if (!hasBadge(user, 'level_5_achieved') && user.level >= 5) {
    addBadge(newBadges, 'level_5_achieved', 'Level 5 Achieved', 'Reached level 5');
  }
  
  if (!hasBadge(user, 'level_10_achieved') && user.level >= 10) {
    addBadge(newBadges, 'level_10_achieved', 'Level 10 Achieved', 'Reached level 10');
  }
  
  if (!hasBadge(user, 'level_15_achieved') && user.level >= 15) {
    addBadge(newBadges, 'level_15_achieved', 'Level 15 Master', 'Reached level 15');
  }
  
  // Add any new badges to user
  if (newBadges.length > 0) {
    newBadges.forEach(badge => user.badges.push(badge));
  }
  
  return newBadges;
}

// Helper functions for badge checks
function hasBadge(user, badgeId) {
  return user.badges?.some(b => b.badgeId === badgeId);
}

function hasCompletedLessons(user, count) {
  return (user.completedLessons?.length || 0) >= count;
}

function countPerfectQuizzes(user) {
  return user.quizAttempts?.filter(q => q.score === q.totalQuestions)?.length || 0;
}

function countPassedQuizzes(user) {
  return user.quizAttempts?.filter(q => q.passed)?.length || 0;
}

function addBadge(badgesArray, id, name, description) {
  badgesArray.push({
    badgeId: id,
    name,
    description,
    unlocked: true,
    dateEarned: new Date()
  });
}
