import mongoose from 'mongoose';
//import logger from '../utils/logger.js';

// Function to check if connected to MongoDB
export const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Define User Schema
const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // Don't include password in queries by default
  },
  fullname: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  profile_image: {
    type: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date
  },
  completedLessons: [
    {
      lessonId: { type: String, required: true },
      dateCompleted: { type: Date, required: true },
      timeSpentSec: { type: Number, default: 0 }
      // Removed quizScore and attempts from here; will be derived from quizAttempts
    }
  ],
  quizAttempts: [
    {
      quizId: { type: String, required: true },
      lessonId: { type: String }, // Made optional
      score: { type: Number, default: 0 }, // Made optional with default
      totalQuestions: { type: Number, default: 0 }, // Made optional with default
      percentage: { type: Number, default: 0 }, // Made optional with default
      passed: { type: Boolean, default: false }, // Made optional with default
      dateTaken: { type: Date, default: Date.now }, // Made optional with default
      timeTaken: { type: Number, default: 0 }
    }
  ],
  totalXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [
    {
      badgeId: String,
      name: String,
      unlocked: { type: Boolean, default: false },
      dateEarned: Date
    }
  ],
  lastLogin: Date,
  loginStreak: { type: Number, default: 0 }
});

// Create model
const User = mongoose.model('User', userSchema);

export default User;

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (userData) => {
  try {
    // Generate a unique user ID if not provided
    if (!userData.id) {
      userData.id = `user_${Date.now()}`;
    }

    const user = new User(userData);
    return await user.save();
  } catch (error) {
    //logger.error(`Error creating user: ${error.message}`);
    throw error;
  }
};

/**
 * Get a user by their ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (userId) => {
  try {
    return await User.findOne({ id: userId });
  } catch (error) {
    //logger.error(`Error getting user by ID: ${error.message}`);
    throw error;
  }
};

/**
 * Get a user by their email
 * @param {string} email - User email
 * @returns {Promise<Object>} User data
 */
export const getUserByEmail = async (email) => {
  try {
    // Include password field for authentication
    return await User.findOne({ email }).select('+password');
  } catch (error) {
    //logger.error(`Error getting user by email: ${error.message}`);
    throw error;
  }
};

/**
 * Update a user
 * @param {string} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (userId, userData) => {
  try {
    return await User.findOneAndUpdate(
      { id: userId },
      userData,
      { new: true, runValidators: true }
    );
  } catch (error) {
    //logger.error(`Error updating user: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteUser = async (userId) => {
  try {
    await User.deleteOne({ id: userId });
    return true;
  } catch (error) {
    //logger.error(`Error deleting user: ${error.message}`);
    throw error;
  }
};

/**
 * Record user login and update login streak
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user
 */
export const recordLogin = async (userId) => {
  try {
    const user = await User.findOne({ id: userId });
    if (!user) throw new Error('User not found');
    const now = new Date();
    let newStreak = 1;
    if (user.last_login) {
      const last = new Date(user.last_login);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (last.toDateString() === yesterday.toDateString()) {
        newStreak = (user.loginStreak || 0) + 1;
      }
    }
    user.last_login = now;
    user.loginStreak = newStreak;
    await user.save();
    return user;
  } catch (error) {
    //logger.error(`Error recording login: ${error.message}`);
    throw error;
  }
};

/**
 * Get user roles
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User roles
 */
export const getUserRoles = async (userId) => {
  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      return [];
    }
    
    // Return the role as an array for compatibility with the previous roles system
    return [{ id: user.role, name: user.role }];
  } catch (error) {
    //logger.error(`Error getting user roles: ${error.message}`);
    throw error;
  }
};

/**
 * Assign a role to a user
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @returns {Promise<Object>} Updated user
 */
export const assignRoleToUser = async (userId, roleId) => {
  try {
    // Validate role
    const validRoles = ['student', 'teacher', 'admin'];
    if (!validRoles.includes(roleId)) {
      throw new Error('Invalid role');
    }
    
    return await User.findOneAndUpdate(
      { id: userId },
      { role: roleId },
      { new: true }
    );
  } catch (error) {
    //logger.error(`Error assigning role to user: ${error.message}`);
    throw error;
  }
};

/**
 * Get all users
 * @param {Object} options - Options for filtering, sorting, and pagination
 * @returns {Promise<Array>} Array of users
 */
export const getAllUsers = async (options = {}) => {
  try {
    const query = User.find();
    
    // Apply filtering
    if (options.filter) {
      if (options.filter.role) {
        query.where('role').equals(options.filter.role);
      }
      if (options.filter.email) {
        query.where('email').regex(new RegExp(options.filter.email, 'i'));
      }
      if (options.filter.fullname) {
        query.where('fullname').regex(new RegExp(options.filter.fullname, 'i'));
      }
    }
    
    // Apply sorting
    if (options.sort) {
      query.sort(options.sort);
    } else {
      query.sort({ created_at: -1 });
    }
    
    // Apply pagination
    if (options.page && options.limit) {
      const skip = (options.page - 1) * options.limit;
      query.skip(skip).limit(options.limit);
    }
    
    return await query.exec();
  } catch (error) {
    //logger.error(`Error getting all users: ${error.message}`);
    throw error;
  }
};

/**
 * Get all available roles in the system
 * @returns {Promise<Array>} Array of roles
 */
export const getAllRoles = async () => {
  // For simplicity, return predefined roles
  return [
    { id: 'student', name: 'student', description: 'Regular student user' },
    { id: 'teacher', name: 'teacher', description: 'Teacher with content creation privileges' },
    { id: 'admin', name: 'admin', description: 'Administrator with full access' }
  ];
};