import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import Lesson from './lessonModel.js';

// Define Progress Schema
const progressSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true,
  },
  lesson_id: {
    type: String,
    required: true,
    index: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  time_spent: {
    type: Number,
    default: 0,
  },
  last_position: {
    type: Number,
    default: 0,
  },
  completed_at: {
    type: Date,
  },
  started_at: {
    type: Date,
    default: Date.now,
  },
  last_accessed: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

// Compound index for uniqueness
progressSchema.index({ user_id: 1, lesson_id: 1 }, { unique: true });

// Create model
const Progress = mongoose.model('Progress', progressSchema);

/**
 * Get progress for a specific user and lesson
 * @param {string} userId - User ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object|null>} Progress data or null if not found
 */
export const getProgress = async (userId, lessonId) => {
  try {
    return await Progress.findOne({ user_id: userId, lesson_id: lessonId });
  } catch (error) {
    logger.error(`Error getting progress: ${error.message}`);
    throw error;
  }
};

/**
 * Get all progress entries for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of progress entries
 */
export const getAllUserProgress = async (userId) => {
  try {
    return await Progress.find({ user_id: userId });
  } catch (error) {
    logger.error(`Error getting all user progress: ${error.message}`);
    throw error;
  }
};

/**
 * Upsert (update or insert) progress for a user and lesson
 * @param {string} userId - User ID
 * @param {string} lessonId - Lesson ID
 * @param {Object} data - Progress data to update
 * @returns {Promise<Object>} Updated progress
 */
export const upsertProgress = async (userId, lessonId, data) => {
  try {
    // Set completed_at timestamp if not set and lesson is being completed
    if (data.completed && !data.completed_at) {
      data.completed_at = new Date();
    }
    
    // Always update last_accessed
    data.last_accessed = new Date();

    const result = await Progress.findOneAndUpdate(
      { user_id: userId, lesson_id: lessonId },
      { $set: data },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true 
      }
    );
    
    return result;
  } catch (error) {
    logger.error(`Error upserting progress: ${error.message}`);
    throw error;
  }
};

/**
 * Delete progress for a user and lesson
 * @param {string} userId - User ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteProgress = async (userId, lessonId) => {
  try {
    await Progress.deleteOne({ user_id: userId, lesson_id: lessonId });
    return true;
  } catch (error) {
    logger.error(`Error deleting progress: ${error.message}`);
    throw error;
  }
};

/**
 * Get progress statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Progress statistics
 */
export const getProgressStats = async (userId) => {
  try {
    // Get all progress for user
    const allProgress = await Progress.find({ user_id: userId });
    
    // Get total number of lessons for completion rate calculation
    const totalLessons = await mongoose.model('Lesson').countDocuments();
    
    // Calculate statistics
    const completedLessons = allProgress.filter(p => p.completed).length;
    const totalTimeSpent = allProgress.reduce((sum, p) => sum + (p.time_spent || 0), 0);
    const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    
    // Get lesson with most time spent
    let mostTimeSpentLesson = null;
    if (allProgress.length > 0) {
      const lessonWithMostTime = allProgress.reduce(
        (prev, current) => (prev.time_spent > current.time_spent) ? prev : current
      );
      
      const lesson = await Lesson.findOne({ id: lessonWithMostTime.lesson_id });
      if (lesson) {
        mostTimeSpentLesson = {
          id: lesson.id,
          title: lesson.title,
          time_spent: lessonWithMostTime.time_spent
        };
      }
    }
    
    return {
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      completion_rate: completionRate,
      in_progress_lessons: allProgress.length - completedLessons,
      total_time_spent: totalTimeSpent,
      most_time_spent: mostTimeSpentLesson
    };
  } catch (error) {
    logger.error(`Error getting progress stats: ${error.message}`);
    throw error;
  }
};

/**
 * Get detailed progress with lesson information
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Detailed progress data
 */
export const getDetailedProgress = async (userId) => {
  try {
    // Use MongoDB aggregation to join progress with lessons
    const detailedProgress = await Progress.aggregate([
      { $match: { user_id: userId } },
      {
        $lookup: {
          from: 'lessons',
          localField: 'lesson_id',
          foreignField: 'id',
          as: 'lesson'
        }
      },
      { $unwind: '$lesson' },
      {
        $project: {
          _id: 0,
          user_id: 1,
          lesson_id: 1,
          completed: 1,
          time_spent: 1,
          last_position: 1,
          completed_at: 1,
          started_at: 1,
          last_accessed: 1,
          'lesson.id': 1,
          'lesson.title': 1,
          'lesson.description': 1,
          'lesson.type': 1,
          'lesson.difficulty': 1
        }
      }
    ]);
    
    return detailedProgress;
  } catch (error) {
    logger.error(`Error getting detailed progress: ${error.message}`);
    throw error;
  }
};

export default Progress;