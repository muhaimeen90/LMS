import supabase from '../config/supabaseClient.js';
import logger from '../utils/logger.js';

const usersTable = 'users';

/**
 * Get a user by ID
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (userId) => {
  try {
    // First, try to get the user from Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError) {
      logger.error(`Error getting user from auth: ${authError.message}`);
    }
    
    // Then get user data from the users table
    const { data: userData, error: dataError } = await supabase
      .from(usersTable)
      .select('*')
      .eq('id', userId)
      .single();
    
    if (dataError) throw dataError;
    
    // Combine auth data with profile data
    return {
      ...authUser?.user,
      ...userData
    };
  } catch (error) {
    logger.error(`Error getting user by ID: ${error.message}`);
    throw error;
  }
};

/**
 * Get a user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} User data
 */
export const getUserByEmail = async (email) => {
  try {
    // First, try to find the user in Supabase Auth by email
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({
      filter: {
        email: email
      }
    });
    
    if (authError) {
      logger.error(`Error finding user by email in auth: ${authError.message}`);
    }
    
    const authUser = users?.length > 0 ? users[0] : null;
    
    // If we found the user in auth, get their data from the users table
    if (authUser) {
      const { data: userData, error: dataError } = await supabase
        .from(usersTable)
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (dataError && dataError.code !== 'PGRST116') throw dataError; // PGRST116 is "no rows returned"
      
      // Combine auth data with profile data
      return {
        ...authUser,
        ...userData
      };
    }
    
    // As a fallback, try to find the user in the users table directly
    const { data: userData, error: dataError } = await supabase
      .from(usersTable)
      .select('*')
      .eq('email', email)
      .single();
    
    if (dataError && dataError.code !== 'PGRST116') throw dataError;
    
    return userData || null;
  } catch (error) {
    logger.error(`Error getting user by email: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new user with Supabase Auth
 * @param {Object} userData - User data including email, password, and optional metadata
 * @returns {Promise<Object>} Created user data
 */
export const createUser = async (userData = {}) => {
  try {
    const { email, password, ...metadata } = userData;
    
    // If email and password are provided, create an authenticated user
    if (email && password) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (authError) throw authError;
      
      // Insert additional user data into the users table
      const { data: profileData, error: profileError } = await supabase
        .from(usersTable)
        .insert([{ id: authData.user.id, email, ...metadata }])
        .select()
        .single();
      
      if (profileError) throw profileError;
      
      return {
        ...authData.user,
        ...profileData
      };
    } else {
      // For anonymous users, just create a record in the users table
      const { data, error } = await supabase
        .from(usersTable)
        .insert([userData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    throw error;
  }
};

/**
 * Create an anonymous user with no email
 * @returns {Promise<Object>} Created user data with UUID
 */
export const createAnonymousUser = async () => {
  // Create an anonymous session
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: `anonymous_${Date.now()}@example.com`,
    password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
  });
  
  if (authError) {
    logger.error(`Error creating anonymous auth user: ${authError.message}`);
    // Fall back to creating just a database record
    return createUser({});
  }
  
  // Create user record
  return createUser({ id: authData.user.id, is_anonymous: true });
};

/**
 * Update a user
 * @param {string} userId - User UUID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user data
 */
export const updateUser = async (userId, userData) => {
  try {
    const { email, password, ...profileData } = userData;
    let authUpdateResult = null;
    
    // If email or password are provided, update them in Auth
    if (email || password) {
      const updateData = {};
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      
      const { data, error } = await supabase.auth.admin.updateUserById(
        userId,
        updateData
      );
      
      if (error) throw error;
      authUpdateResult = data;
    }
    
    // Update user metadata
    if (Object.keys(profileData).length > 0) {
      const { data, error } = await supabase
        .from(usersTable)
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...authUpdateResult?.user,
        ...data
      };
    }
    
    // If we only updated auth data, get the latest profile data to return
    if (authUpdateResult) {
      const { data, error } = await supabase
        .from(usersTable)
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      return {
        ...authUpdateResult.user,
        ...data
      };
    }
    
    return null;
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a user
 * @param {string} userId - User UUID
 * @returns {Promise<boolean>} Success status
 */
export const deleteUser = async (userId) => {
  try {
    // Delete from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      logger.error(`Error deleting user from auth: ${authError.message}`);
      // Continue with database deletion even if auth deletion fails
    }
    
    // Delete from users table
    const { error: dbError } = await supabase
      .from(usersTable)
      .delete()
      .eq('id', userId);
    
    if (dbError) throw dbError;
    return true;
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    throw error;
  }
};

/**
 * Request a password reset email
 * @param {string} email - User email
 * @returns {Promise<boolean>} Success status
 */
export const requestPasswordReset = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.PASSWORD_RESET_REDIRECT_URL || `${process.env.CORS_ORIGIN}/auth/reset-password`,
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    logger.error(`Error requesting password reset: ${error.message}`);
    throw error;
  }
};

/**
 * Update user password with the recovery token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Updated user data
 */
export const updatePasswordWithToken = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error updating password with token: ${error.message}`);
    throw error;
  }
};

/**
 * Verify a user's email
 * @param {string} token - Email verification token
 * @returns {Promise<Object>} Updated user data
 */
export const verifyEmail = async (token) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email_confirmation'
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error verifying email: ${error.message}`);
    throw error;
  }
};

/**
 * Request a new verification email
 * @param {string} email - User email
 * @returns {Promise<boolean>} Success status
 */
export const requestEmailVerification = async (email) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        redirectTo: process.env.EMAIL_VERIFICATION_REDIRECT_URL || `${process.env.CORS_ORIGIN}/auth/verify-email`,
      }
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    logger.error(`Error requesting email verification: ${error.message}`);
    throw error;
  }
};

/**
 * Link an OAuth provider to a user account
 * @param {string} provider - OAuth provider ('google', 'github', etc.)
 * @returns {Promise<string>} URL to redirect the user to
 */
export const linkOAuthProvider = async (provider) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.CORS_ORIGIN}/auth/callback`,
        scopes: 'email profile',
      }
    });
    
    if (error) throw error;
    return data.url;
  } catch (error) {
    logger.error(`Error linking OAuth provider: ${error.message}`);
    throw error;
  }
};

/**
 * Unlink an OAuth provider from a user account
 * @param {string} provider - OAuth provider ('google', 'github', etc.)
 * @returns {Promise<boolean>} Success status
 */
export const unlinkOAuthProvider = async (provider) => {
  try {
    // This requires a custom function in Supabase edge functions
    // or a direct call to the Supabase API
    const { error } = await supabase.functions.invoke('unlink-oauth-provider', {
      body: { provider }
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    logger.error(`Error unlinking OAuth provider: ${error.message}`);
    throw error;
  }
};

/**
 * Enable multi-factor authentication for a user
 * @param {string} factorType - Factor type ('totp')
 * @returns {Promise<Object>} MFA setup data
 */
export const enableMFA = async (factorType = 'totp') => {
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error enabling MFA: ${error.message}`);
    throw error;
  }
};

/**
 * Verify a multi-factor authentication code
 * @param {string} factorId - Factor ID
 * @param {string} code - Verification code
 * @returns {Promise<Object>} Challenge verification result
 */
export const verifyMFA = async (factorId, code) => {
  try {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId,
      code
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error verifying MFA code: ${error.message}`);
    throw error;
  }
};

/**
 * Disable multi-factor authentication for a user
 * @param {string} factorId - Factor ID
 * @returns {Promise<boolean>} Success status
 */
export const disableMFA = async (factorId) => {
  try {
    const { error } = await supabase.auth.mfa.unenroll({
      factorId
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    logger.error(`Error disabling MFA: ${error.message}`);
    throw error;
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    if (user) {
      // Get additional user data from the users table
      const { data: userData, error: userError } = await supabase
        .from(usersTable)
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (userError && userError.code !== 'PGRST116') throw userError;
      
      return {
        ...user,
        ...userData
      };
    }
    
    return null;
  } catch (error) {
    logger.error(`Error getting current user: ${error.message}`);
    throw error;
  }
};

/**
 * Get user roles and permissions
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} Array of user roles with permissions
 */
export const getUserRoles = async (userId) => {
  try {
    // Get user roles from the user_roles junction table
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        role,
        roles (
          id,
          name,
          description
        ),
        created_at
      `)
      .eq('user_id', userId);
    
    if (rolesError) throw rolesError;
    
    // Format the roles
    return userRoles.map(userRole => ({
      role: userRole.roles.name,
      roleId: userRole.roles.id,
      description: userRole.roles.description,
      assignedAt: userRole.created_at
    }));
  } catch (error) {
    logger.error(`Error getting user roles: ${error.message}`);
    throw error;
  }
};

/**
 * Assign a role to a user
 * @param {string} userId - User UUID
 * @param {string} roleId - Role ID
 * @returns {Promise<Object>} Assignment result
 */
export const assignRoleToUser = async (userId, roleId) => {
  try {
    // Check if the role already exists for the user
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', roleId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    // If role already assigned, return it
    if (existingRole) {
      return existingRole;
    }
    
    // Insert the new role assignment
    const { data, error } = await supabase
      .from('user_roles')
      .insert([
        { user_id: userId, role: roleId }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error assigning role to user: ${error.message}`);
    throw error;
  }
};

/**
 * Remove a role from a user
 * @param {string} userId - User UUID
 * @param {string} roleId - Role ID
 * @returns {Promise<boolean>} True if removed successfully
 */
export const removeRoleFromUser = async (userId, roleId) => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', roleId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    logger.error(`Error removing role from user: ${error.message}`);
    throw error;
  }
};

/**
 * Get all available roles in the system
 * @returns {Promise<Array>} Array of roles
 */
export const getAllRoles = async () => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error getting all roles: ${error.message}`);
    throw error;
  }
};

/**
 * Check if a user has a specific permission
 * @param {string} userId - User UUID
 * @param {string} permission - Permission name to check
 * @returns {Promise<boolean>} Whether user has the permission
 */
export const hasPermission = async (userId, permission) => {
  try {
    const userRoles = await getUserRoles(userId);
    
    // Check if any of the user's roles contain the required permission
    return userRoles.some(role => 
      role.permissions && role.permissions.includes(permission)
    );
  } catch (error) {
    logger.error(`Error checking permission: ${error.message}`);
    throw error;
  }
};