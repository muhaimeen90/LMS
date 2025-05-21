import supabase from '../config/supabaseClient.js';
import logger from '../utils/logger.js';

const lessonsTable = 'lessons';

/**
 * Get all lessons ordered by position
 * @returns {Promise<Array>} Array of lesson objects
 */
export const getAllLessons = async () => {
  try {
    const { data, error } = await supabase
      .from(lessonsTable)
      .select('*')
      .order('position', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error(`Error getting all lessons: ${error.message}`);
    throw error;
  }
};

/**
 * Get a lesson by ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Lesson data
 */
export const getLessonById = async (lessonId) => {
  try {
    const { data, error } = await supabase
      .from(lessonsTable)
      .select('*')
      .eq('id', lessonId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error getting lesson by ID: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new lesson
 * @param {Object} lessonData - Lesson data (id, title, description, position, metadata)
 * @returns {Promise<Object>} Created lesson data
 */
export const createLesson = async (lessonData) => {
  try {
    // Get max position if not provided
    if (!lessonData.position) {
      const { data: maxPositionData } = await supabase
        .from(lessonsTable)
        .select('position')
        .order('position', { ascending: false })
        .limit(1)
        .single();
      
      lessonData.position = maxPositionData ? maxPositionData.position + 1 : 1;
    }
    
    const { data, error } = await supabase
      .from(lessonsTable)
      .insert([lessonData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error creating lesson: ${error.message}`);
    throw error;
  }
};

/**
 * Update a lesson
 * @param {string} lessonId - Lesson ID
 * @param {Object} lessonData - Updated lesson data
 * @returns {Promise<Object>} Updated lesson data
 */
export const updateLesson = async (lessonId, lessonData) => {
  try {
    const { data, error } = await supabase
      .from(lessonsTable)
      .update(lessonData)
      .eq('id', lessonId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error updating lesson: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a lesson
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteLesson = async (lessonId) => {
  try {
    const { error } = await supabase
      .from(lessonsTable)
      .delete()
      .eq('id', lessonId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    logger.error(`Error deleting lesson: ${error.message}`);
    throw error;
  }
};

/**
 * Update multiple lessons' positions
 * @param {Array} positionUpdates - Array of {id, position} objects
 * @returns {Promise<boolean>} Success status
 */
export const updateLessonPositions = async (positionUpdates) => {
  try {
    // Use a transaction to ensure all updates succeed or fail together
    const updates = positionUpdates.map(update => {
      return supabase
        .from(lessonsTable)
        .update({ position: update.position })
        .eq('id', update.id);
    });
    
    await Promise.all(updates);
    return true;
  } catch (error) {
    logger.error(`Error updating lesson positions: ${error.message}`);
    throw error;
  }
};