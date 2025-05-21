import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as userModel from '../models/userModel.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/apiError.js';

// Load environment variables
dotenv.config();

// JWT secret key and expiration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Register a new user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, fullname } = req.body;

    // Check if email already exists
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return next(new ApiError('Email already in use', 409));
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in MongoDB
    const newUser = await userModel.createUser({
      email,
      password: hashedPassword,
      fullname,
      role: 'student', // Default role
      status: 'active'
    });

    // Remove sensitive data before sending response
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      fullname: newUser.fullname,
      role: newUser.role,
      created_at: newUser.created_at
    };

    res.status(201).json({
      status: 'success',
      data: userResponse
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    next(new ApiError('Registration failed', 500));
  }
};

/**
 * Login a user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user from database (with password)
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return next(new ApiError('Invalid email or password', 401));
    }

    // Check if user is active
    if (user.status !== 'active') {
      return next(new ApiError('Your account is not active', 403));
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new ApiError('Invalid email or password', 401));
    }

    // Record login time
    await userModel.recordLogin(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove sensitive data before sending response
    const userResponse = {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      role: user.role
    };

    res.status(200).json({
      status: 'success',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(new ApiError('Login failed', 500));
  }
};

/**
 * Get the current logged in user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user data
    const user = await userModel.getUserById(userId);
    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    // Remove sensitive data
    const userResponse = {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      role: user.role,
      profile_image: user.profile_image,
      created_at: user.created_at,
      last_login: user.last_login
    };

    res.status(200).json({
      status: 'success',
      data: userResponse
    });
  } catch (error) {
    logger.error(`Get current user error: ${error.message}`);
    next(new ApiError('Failed to get user data', 500));
  }
};

/**
 * Update user profile
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullname, profile_image } = req.body;

    // Prepare update data
    const updateData = {};
    if (fullname) updateData.fullname = fullname;
    if (profile_image) updateData.profile_image = profile_image;

    // Update user in database
    const updatedUser = await userModel.updateUser(userId, updateData);
    if (!updatedUser) {
      return next(new ApiError('User not found', 404));
    }

    // Remove sensitive data
    const userResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullname: updatedUser.fullname,
      profile_image: updatedUser.profile_image
    };

    res.status(200).json({
      status: 'success',
      data: userResponse
    });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    next(new ApiError('Failed to update profile', 500));
  }
};

/**
 * Change password
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await userModel.getUserByEmail(req.user.email);
    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return next(new ApiError('Current password is incorrect', 401));
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await userModel.updateUser(userId, { password: hashedPassword });

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    next(new ApiError('Failed to change password', 500));
  }
};

/**
 * Admin: Get all users
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const getAllUsers = async (req, res, next) => {
  try {
    // Get query parameters for filtering and pagination
    const { role, email, page = 1, limit = 10 } = req.query;
    
    // Prepare options
    const options = {
      filter: {},
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };
    
    if (role) options.filter.role = role;
    if (email) options.filter.email = email;
    
    // Get users from database
    const users = await userModel.getAllUsers(options);
    
    // Clean up sensitive data
    const usersResponse = users.map(user => ({
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      last_login: user.last_login
    }));

    res.status(200).json({
      status: 'success',
      results: usersResponse.length,
      data: usersResponse
    });
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    next(new ApiError('Failed to get users', 500));
  }
};

/**
 * Admin: Get user by ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get user from database
    const user = await userModel.getUserById(id);
    if (!user) {
      return next(new ApiError('User not found', 404));
    }
    
    // Remove sensitive data
    const userResponse = {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      role: user.role,
      status: user.status,
      profile_image: user.profile_image,
      created_at: user.created_at,
      last_login: user.last_login
    };

    res.status(200).json({
      status: 'success',
      data: userResponse
    });
  } catch (error) {
    logger.error(`Get user by ID error: ${error.message}`);
    next(new ApiError('Failed to get user', 500));
  }
};

/**
 * Admin: Update user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullname, role, status } = req.body;
    
    // Prepare update data
    const updateData = {};
    if (fullname) updateData.fullname = fullname;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    
    // Update user in database
    const updatedUser = await userModel.updateUser(id, updateData);
    if (!updatedUser) {
      return next(new ApiError('User not found', 404));
    }
    
    // Remove sensitive data
    const userResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullname: updatedUser.fullname,
      role: updatedUser.role,
      status: updatedUser.status
    };

    res.status(200).json({
      status: 'success',
      data: userResponse
    });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    next(new ApiError('Failed to update user', 500));
  }
};

/**
 * Admin: Delete user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await userModel.getUserById(id);
    if (!user) {
      return next(new ApiError('User not found', 404));
    }
    
    // Delete user from database
    await userModel.deleteUser(id);
    
    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`);
    next(new ApiError('Failed to delete user', 500));
  }
};

/**
 * Admin: Get user roles
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const getUserRoles = async (req, res, next) => {
  try {
    // Get all available roles
    const roles = await userModel.getAllRoles();
    
    res.status(200).json({
      status: 'success',
      data: roles
    });
  } catch (error) {
    logger.error(`Get user roles error: ${error.message}`);
    next(new ApiError('Failed to get roles', 500));
  }
};

/**
 * Admin: Assign role to user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const assignRoleToUser = async (req, res, next) => {
  try {
    const { userId, roleId } = req.params;
    
    // Check if user exists
    const user = await userModel.getUserById(userId);
    if (!user) {
      return next(new ApiError('User not found', 404));
    }
    
    // Assign role to user
    await userModel.assignRoleToUser(userId, roleId);
    
    res.status(200).json({
      status: 'success',
      message: 'Role assigned successfully'
    });
  } catch (error) {
    logger.error(`Assign role error: ${error.message}`);
    next(new ApiError('Failed to assign role', 500));
  }
};