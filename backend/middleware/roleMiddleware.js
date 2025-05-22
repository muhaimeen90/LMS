import ApiError from '../utils/apiError.js';

// Middleware to restrict access to teacher role only
export const teacherOnly = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }
    
    if (user.role !== 'teacher' && user.role !== 'admin') {
      throw new ApiError(403, "Access denied. Teacher privileges required");
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to restrict access to admin role only
export const adminOnly = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }
    
    if (user.role !== 'admin') {
      throw new ApiError(403, "Access denied. Admin privileges required");
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user is either a student or owns the resource
export const studentOrOwner = (req, res, next) => {
  try {
    const user = req.user;
    const resourceOwnerId = req.params.userId || req.body.userId;
    
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }
    
    // Allow if user is the owner of the resource
    if (resourceOwnerId && user._id.toString() === resourceOwnerId.toString()) {
      return next();
    }
    
    // Allow if user is a student
    if (user.role === 'student') {
      return next();
    }
    
    // Allow teachers and admins
    if (['teacher', 'admin'].includes(user.role)) {
      return next();
    }
    
    throw new ApiError(403, "Access denied");
  } catch (error) {
    next(error);
  }
};