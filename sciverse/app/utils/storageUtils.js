'use client';

/**
 * Storage utility functions for tracking user progress and preferences
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Save progress data for a specific lesson
 * @param {string} lessonId - The unique identifier for the lesson
 * @param {object} data - The progress data object
 * @param {string} type - The type of progress data (completed, score, attempts, etc.)
 */
export const saveProgress = (lessonId, data, type) => {
  if (!isBrowser) return;
  
  const key = `${type}_${lessonId}`;
  localStorage.setItem(key, JSON.stringify(data));
};

/**
 * Get progress data for a specific lesson
 * @param {string} lessonId - The unique identifier for the lesson
 * @param {string} type - The type of progress data (completed, score, attempts, etc.)
 * @returns {any} The stored progress data
 */
export const getProgress = (lessonId, type) => {
  if (!isBrowser) return null;
  
  try {
    const key = `${type}_${lessonId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error retrieving progress for ${lessonId}:`, error);
    return null;
  }
};

/**
 * Get all progress data
 * @returns {object} Object containing all progress data
 */
export const getAllProgress = () => {
  if (!isBrowser) return {};
  
  try {
    const progressData = {};
    
    // Loop through all localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Only include items related to progress tracking
      if (
        key.startsWith('lesson_') || 
        key.startsWith('quiz_')
      ) {
        const value = localStorage.getItem(key);
        progressData[key] = JSON.parse(value);
      }
    }
    
    return progressData;
  } catch (error) {
    console.error('Error retrieving all progress data:', error);
    return {};
  }
};

/**
 * Mark a lesson as completed
 * @param {string} lessonId - The unique identifier for the lesson
 * @param {boolean} completed - Whether the lesson is completed
 */
export const markLessonCompleted = (lessonId, completed = true) => {
  saveProgress(lessonId, completed, 'lesson_completed');
};

/**
 * Check if a lesson is completed
 * @param {string} lessonId - The unique identifier for the lesson
 * @returns {boolean} Whether the lesson is completed
 */
export const isLessonCompleted = (lessonId) => {
  return getProgress(lessonId, 'lesson_completed') === true;
};

/**
 * Save quiz results
 * @param {string} lessonId - The unique identifier for the associated lesson
 * @param {number} score - The quiz score
 * @param {number} totalQuestions - The total number of questions
 */
export const saveQuizResults = (lessonId, score, totalQuestions) => {
  // Get existing attempts
  const attempts = getProgress(lessonId, 'quiz_attempts') || 0;
  
  // Save score
  saveProgress(lessonId, score, 'quiz_score');
  
  // Save total questions
  saveProgress(lessonId, totalQuestions, 'quiz_total_questions');
  
  // Increment attempts
  saveProgress(lessonId, attempts + 1, 'quiz_attempts');
  
  // Save timestamp
  saveProgress(lessonId, new Date().toISOString(), 'quiz_last_attempt_time');
};

/**
 * Get quiz score for a specific lesson
 * @param {string} lessonId - The unique identifier for the lesson
 * @returns {object|null} Object with score and totalQuestions
 */
export const getQuizScore = (lessonId) => {
  const score = getProgress(lessonId, 'quiz_score');
  const totalQuestions = getProgress(lessonId, 'quiz_total_questions');
  const attempts = getProgress(lessonId, 'quiz_attempts');
  const lastAttemptTime = getProgress(lessonId, 'quiz_last_attempt_time');
  
  if (score === null) return null;
  
  return {
    score,
    totalQuestions,
    attempts,
    lastAttemptTime
  };
};

/**
 * Track time spent on a lesson
 * @param {string} lessonId - The unique identifier for the lesson
 * @param {number} seconds - Time spent in seconds
 */
export const trackLessonTime = (lessonId, seconds) => {
  // Get existing time
  const existingTime = getProgress(lessonId, 'lesson_timeSpent') || 0;
  
  // Add new time
  saveProgress(lessonId, existingTime + seconds, 'lesson_timeSpent');
};

/**
 * Get time spent on a lesson
 * @param {string} lessonId - The unique identifier for the lesson
 * @returns {number} Time spent in seconds
 */
export const getLessonTimeSpent = (lessonId) => {
  return getProgress(lessonId, 'lesson_timeSpent') || 0;
};

/**
 * Calculate overall progress across all lessons
 * @param {Array} lessons - Array of all lesson objects
 * @returns {number} Percentage of lessons completed (0-100)
 */
export const calculateOverallProgress = (lessons) => {
  if (!lessons || lessons.length === 0) return 0;
  
  let completedCount = 0;
  
  lessons.forEach(lesson => {
    if (isLessonCompleted(lesson.id)) {
      completedCount++;
    }
  });
  
  return Math.round((completedCount / lessons.length) * 100);
};

/**
 * Determine the next recommended lesson
 * @param {Array} lessons - Array of all lesson objects
 * @returns {object|null} Recommended lesson object or null
 */
export const getRecommendedLesson = (lessons) => {
  if (!lessons || lessons.length === 0) return null;
  
  // Find the first incomplete lesson
  const incompleteLesson = lessons.find(lesson => !isLessonCompleted(lesson.id));
  if (incompleteLesson) return incompleteLesson;
  
  // If all lessons are complete, find the one with the lowest quiz score
  let lowestScoreLesson = null;
  let lowestScorePercentage = 100;
  
  lessons.forEach(lesson => {
    const quizData = getQuizScore(lesson.id);
    if (quizData) {
      const scorePercentage = (quizData.score / quizData.totalQuestions) * 100;
      if (scorePercentage < lowestScorePercentage) {
        lowestScorePercentage = scorePercentage;
        lowestScoreLesson = lesson;
      }
    }
  });
  
  return lowestScoreLesson;
};

/**
 * Reset all progress data
 */
export const resetProgress = () => {
  if (!isBrowser) return;
  
  // Loop through all localStorage items
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    
    // Only remove items related to progress tracking
    if (
      key.startsWith('lesson_') || 
      key.startsWith('quiz_')
    ) {
      localStorage.removeItem(key);
    }
  }
};
