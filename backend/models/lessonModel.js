import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// Define Lesson Schema
const lessonSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'text', 'interactive', 'mixed'],
    default: 'text'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  grade: {
    type: String,
    enum: ['grade9', 'grade10', 'grade11', 'grade12', 'undergraduate'],
    default: 'grade9'
  },
  material_url: {
    type: String
  },
  created_by: {
    type: String,
    ref: 'User',
    index: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  tags: {
    type: [String],
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Create model
const Lesson = mongoose.model('Lesson', lessonSchema);

/**
 * Create a new lesson
 * @param {Object} lessonData - Lesson data
 * @returns {Promise<Object>} Created lesson
 */
export const createLesson = async (lessonData) => {
  try {
    // Generate a unique lesson ID if not provided
    if (!lessonData.id) {
      lessonData.id = `lesson_${Date.now()}`;
    }

    const lesson = new Lesson(lessonData);
    return await lesson.save();
  } catch (error) {
    logger.error(`Error creating lesson: ${error.message}`);
    throw error;
  }
};

/**
 * Get all lessons with optional filtering and sorting
 * @param {Object} options - Options for filtering, sorting, and pagination
 * @returns {Promise<Array>} Array of lessons
 */
export const getAllLessons = async (options = {}) => {
  try {
    const query = Lesson.find();
    
    // Apply filtering
    if (options.filter) {
      if (options.filter.title) {
        query.where('title').regex(new RegExp(options.filter.title, 'i'));
      }
      if (options.filter.type) {
        query.where('type').equals(options.filter.type);
      }
      if (options.filter.difficulty) {
        query.where('difficulty').equals(options.filter.difficulty);
      }
      if (options.filter.tags) {
        if (Array.isArray(options.filter.tags)) {
          query.where('tags').in(options.filter.tags);
        } else {
          query.where('tags').equals(options.filter.tags);
        }
      }
      if (options.filter.created_by) {
        query.where('created_by').equals(options.filter.created_by);
      }
    }
    
    // Apply sorting
    if (options.sort) {
      query.sort(options.sort);
    } else {
      query.sort({ created_at: 1 });
    }
    
    // Apply pagination
    if (options.page && options.limit) {
      const skip = (options.page - 1) * options.limit;
      query.skip(skip).limit(options.limit);
    }
    
    return await query.exec();
  } catch (error) {
    logger.error(`Error getting all lessons: ${error.message}`);
    throw error;
  }
};

/**
 * Get a lesson by its ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Lesson data
 */
export const getLessonById = async (lessonId) => {
  try {
    return await Lesson.findOne({ id: lessonId });
  } catch (error) {
    logger.error(`Error getting lesson by ID: ${error.message}`);
    throw error;
  }
};

/**
 * Update a lesson
 * @param {string} lessonId - Lesson ID
 * @param {Object} lessonData - Updated lesson data
 * @returns {Promise<Object>} Updated lesson
 */
export const updateLesson = async (lessonId, lessonData) => {
  try {
    // Always update the updated_at field
    if (!lessonData.updated_at) {
      lessonData.updated_at = new Date();
    }

    return await Lesson.findOneAndUpdate(
      { id: lessonId },
      lessonData,
      { new: true, runValidators: true }
    );
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
    await Lesson.deleteOne({ id: lessonId });
    return true;
  } catch (error) {
    logger.error(`Error deleting lesson: ${error.message}`);
    throw error;
  }
};

/**
 * Search lessons by keywords
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of matching lessons
 */
export const searchLessons = async (query, options = {}) => {
  try {
    const searchQuery = Lesson.find({
      $or: [
        { title: { $regex: new RegExp(query, 'i') } },
        { description: { $regex: new RegExp(query, 'i') } },
        { content: { $regex: new RegExp(query, 'i') } },
      ]
    });
    
    // Apply filtering options
    if (options.type) {
      searchQuery.where('type').equals(options.type);
    }
    if (options.difficulty) {
      searchQuery.where('difficulty').equals(options.difficulty);
    }
    
    // Apply sorting
    if (options.sort) {
      searchQuery.sort(options.sort);
    } else {
      searchQuery.sort({ created_at: -1 });
    }
    
    // Apply pagination
    if (options.page && options.limit) {
      const skip = (options.page - 1) * options.limit;
      searchQuery.skip(skip).limit(options.limit);
    } else {
      searchQuery.limit(20); // Default limit
    }
    
    return await searchQuery.exec();
  } catch (error) {
    logger.error(`Error searching lessons: ${error.message}`);
    throw error;
  }
};

export default Lesson;