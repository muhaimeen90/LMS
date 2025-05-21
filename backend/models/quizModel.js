import supabase from '../config/supabaseClient.js';
import logger from '../utils/logger.js';

const quizzesTable = 'quizzes';

/**
 * Create a new quiz result
 * @param {Object} quizData - Quiz data (user_id, lesson_id, score, total_questions, attempt_number)
 * @returns {Promise<Object>} Created quiz data
 */
export const createQuizResult = async (quizData) => {
  try {
    // Make sure attempt_number is provided or get the next attempt number
    if (!quizData.attempt_number) {
      const lastAttempt = await getLatestQuizAttempt(quizData.user_id, quizData.lesson_id);
      quizData.attempt_number = lastAttempt ? lastAttempt.attempt_number + 1 : 1;
    }

    const { data, error } = await supabase
      .from(quizzesTable)
      .insert([quizData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error creating quiz result: ${error.message}`);
    throw error;
  }
};

/**
 * Get the latest quiz attempt for a user and lesson
 * @param {string} userId - User UUID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Quiz data for latest attempt
 */
export const getLatestQuizAttempt = async (userId, lessonId) => {
  try {
    const { data, error } = await supabase
      .from(quizzesTable)
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .order('attempt_number', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignoring "not found" errors
    return data || null;
  } catch (error) {
    logger.error(`Error getting latest quiz attempt: ${error.message}`);
    throw error;
  }
};

/**
 * Get all quiz attempts for a user and lesson
 * @param {string} userId - User UUID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Array>} Array of quiz attempts
 */
export const getUserQuizAttempts = async (userId, lessonId) => {
  try {
    const { data, error } = await supabase
      .from(quizzesTable)
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .order('attempt_number', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error(`Error getting user quiz attempts: ${error.message}`);
    throw error;
  }
};

/**
 * Get all quiz results for a user
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} Array of quiz results
 */
export const getAllUserQuizResults = async (userId) => {
  try {
    const { data, error } = await supabase
      .from(quizzesTable)
      .select(`
        *,
        lessons:lesson_id (
          id,
          title,
          description
        )
      `)
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error(`Error getting all user quiz results: ${error.message}`);
    throw error;
  }
};

/**
 * Get quiz statistics for a user
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Quiz statistics
 */
export const getUserQuizStatistics = async (userId) => {
  try {
    // Get all user quiz attempts
    const { data, error } = await supabase
      .from(quizzesTable)
      .select('lesson_id, score, total_questions')
      .eq('user_id', userId);

    if (error) throw error;

    // Calculate statistics
    const totalAttempts = data.length;
    const totalScore = data.reduce((sum, quiz) => sum + quiz.score, 0);
    const totalQuestions = data.reduce((sum, quiz) => sum + quiz.total_questions, 0);
    const averageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
    
    // Count unique lessons attempted
    const uniqueLessons = new Set(data.map(quiz => quiz.lesson_id)).size;

    return {
      totalAttempts,
      uniqueLessons,
      averageScore,
      totalScore,
      totalQuestions
    };
  } catch (error) {
    logger.error(`Error getting user quiz statistics: ${error.message}`);
    throw error;
  }
};