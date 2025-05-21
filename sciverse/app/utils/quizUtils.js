'use client';

import { getQuizScore, saveQuizResults } from './storageUtils';

/**
 * Calculate score percentage from quiz results
 * @param {number} score - User's score
 * @param {number} totalQuestions - Total number of questions
 * @returns {number} Score percentage (0-100)
 */
export const calculateScorePercentage = (score, totalQuestions) => {
  if (!score || !totalQuestions) return 0;
  return Math.round((score / totalQuestions) * 100);
};

/**
 * Determine if a quiz has been passed
 * @param {number} score - User's score
 * @param {number} totalQuestions - Total number of questions
 * @param {number} passingThreshold - Passing threshold percentage (default: 70)
 * @returns {boolean} Whether the quiz was passed
 */
export const isQuizPassed = (score, totalQuestions, passingThreshold = 70) => {
  return calculateScorePercentage(score, totalQuestions) >= passingThreshold;
};

/**
 * Get color class based on score percentage
 * @param {number} percentage - Score percentage
 * @returns {string} CSS color class for the score
 */
export const getScoreColorClass = (percentage) => {
  if (percentage >= 80) {
    return 'text-green-500 dark:text-green-400';
  } else if (percentage >= 50) {
    return 'text-yellow-500 dark:text-yellow-400';
  } else {
    return 'text-red-500 dark:text-red-400';
  }
};

/**
 * Process quiz submission
 * @param {string} lessonId - Lesson ID
 * @param {Array} questions - Quiz questions
 * @param {Object} selectedAnswers - Selected answers by question index
 * @returns {Object} Quiz results
 */
export const processQuizSubmission = (lessonId, questions, selectedAnswers) => {
  // Calculate score
  let correctAnswers = 0;
  
  questions.forEach((question, index) => {
    const selectedIndex = selectedAnswers[index];
    const correctIndex = question.options.findIndex(opt => opt.id === question.correctOptionId);
    if (selectedIndex === correctIndex) {
      correctAnswers++;
    }
  });
  
  const totalQuestions = questions.length;
  const percentage = calculateScorePercentage(correctAnswers, totalQuestions);
  
  // Save results
  saveQuizResults(lessonId, correctAnswers, totalQuestions);
  
  return {
    score: correctAnswers,
    totalQuestions,
    percentage
  };
};

/**
 * Format date from timestamp
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted date string
 */
export const formatQuizDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  return new Date(timestamp).toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};