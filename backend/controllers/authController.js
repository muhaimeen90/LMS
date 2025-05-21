import supabase from '../config/supabaseClient.js'
import { ApiError } from '../utils/errorHandler.js'
import { catchAsync } from '../utils/errorHandler.js'
import { getUserRoles, assignRoleToUser, removeRoleFromUser, getAllRoles } from '../models/userModel.js'

export const signup = catchAsync(async (req, res) => {
  const { email, password, role } = req.body

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) throw new ApiError(400, error.message)

  // Assign default role to new user (student by default, unless specified)
  try {
    // Get the default role ID (usually 'student')
    const { data: roles } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role || 'student')
      .single();
    
    if (roles && roles.id) {
      await assignRoleToUser(data.user.id, roles.id);
    }
  } catch (roleError) {
    console.error('Error assigning default role:', roleError);
    // Continue with user creation even if role assignment fails
  }

  res.status(201).json({ 
    status: 'success',
    message: 'Signup successful',
    user: data.user 
  })
})

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw new ApiError(401, error.message)

  res.status(200).json({ 
    status: 'success',
    message: 'Login successful',
    user: data.user,
    session: data.session
  })
})

export const logout = catchAsync(async (req, res) => {
  const { error } = await supabase.auth.signOut()
  
  if (error) throw new ApiError(500, error.message)

  res.status(200).json({ 
    status: 'success',
    message: 'Logout successful' 
  })
})

export const getCurrentUser = catchAsync(async (req, res) => {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) throw new ApiError(401, 'Not authenticated')
  if (!user) throw new ApiError(404, 'User not found')

  // Get user roles
  const roles = await getUserRoles(user.id);

  res.status(200).json({
    status: 'success',
    user: {
      ...user,
      roles
    }
  })
})

// Role management endpoints

/**
 * Get all roles for a specific user
 */
export const getUserRolesHandler = catchAsync(async (req, res) => {
  const { userId } = req.params;
  
  const roles = await getUserRoles(userId);
  
  res.status(200).json({
    status: 'success',
    data: { roles }
  });
});

/**
 * Get all available roles in the system
 */
export const getAllRolesHandler = catchAsync(async (req, res) => {
  const roles = await getAllRoles();
  
  res.status(200).json({
    status: 'success',
    data: { roles }
  });
});

/**
 * Assign a role to a user
 */
export const assignRoleHandler = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { roleId } = req.body;
  
  if (!roleId) {
    throw new ApiError(400, 'Role ID is required');
  }
  
  const assignment = await assignRoleToUser(userId, roleId);
  
  res.status(200).json({
    status: 'success',
    message: 'Role assigned successfully',
    data: { assignment }
  });
});

/**
 * Remove a role from a user
 */
export const removeRoleHandler = catchAsync(async (req, res) => {
  const { userId, roleId } = req.params;
  
  const result = await removeRoleFromUser(userId, roleId);
  
  res.status(200).json({
    status: 'success',
    message: 'Role removed successfully'
  });
});