import supabase from '../config/supabaseClient.js';
import logger from '../utils/logger.js';

const progressTable = 'progress';

/**
 * Create or update a user's progress for a lesson
 * @param {Object} progressData - Progress data including user_id, lesson_id, completed, time_spent
 * @returns {Promise<Object>} Created/updated progress data
 */
export const upsertProgress = async (progressData) => {
  try {
    // Use upsert to create or update progress based on unique constraint (user_id, lesson_id)
    const { data, error } = await supabase
      .from(progressTable)
      .upsert(progressData, { 
        onConflict: 'user_id,lesson_id',
        returning: 'representation'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error upserting progress: ${error.message}`);
    throw error;
  }
};

/**
 * Get all progress entries for a user
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} Array of progress entries
 */
export const getUserProgress = async (userId) => {
  try {
    const { data, error } = await supabase
      .from(progressTable)
      .select(`
        *,
        lessons:lesson_id (
          id,
          title,
          description,
          position
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error getting user progress: ${error.message}`);
    throw error;
  }
};

/**
 * Get a specific progress entry for a user and lesson
 * @param {string} userId - User UUID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Progress data
 */
export const getLessonProgress = async (userId, lessonId) => {
  try {
    const { data, error } = await supabase
      .from(progressTable)
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignoring "not found" errors
    return data || null;
  } catch (error) {
    logger.error(`Error getting lesson progress: ${error.message}`);
    throw error;
  }
};

/**
 * Update time spent on a lesson
 * @param {string} userId - User UUID
 * @param {string} lessonId - Lesson ID
 * @param {number} additionalTime - Additional time in seconds
 * @returns {Promise<Object>} Updated progress data
 */
export const updateTimeSpent = async (userId, lessonId, additionalTime) => {
  try {
    // First get current progress
    const current = await getLessonProgress(userId, lessonId);
    
    // If no existing record, create new one
    if (!current) {
      return upsertProgress({
        user_id: userId,
        lesson_id: lessonId,
        time_spent: additionalTime
      });
    }
    
    // Update existing record with new time
    const totalTime = (current.time_spent || 0) + additionalTime;
    
    const { data, error } = await supabase
      .from(progressTable)
      .update({ 
        time_spent: totalTime,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error updating time spent: ${error.message}`);
    throw error;
  }
};

/**
 * Mark a lesson as completed
 * @param {string} userId - User UUID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Updated progress data
 */
export const markLessonCompleted = async (userId, lessonId) => {
  try {
    return upsertProgress({
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error marking lesson as completed: ${error.message}`);
    throw error;
  }
};