"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Create the auth context
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isTeacher: false,
  isAdmin: false,
  isLoading: true,
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setIsLoading(false);
        
        // Redirect to login page if accessing protected routes
        if (isProtectedRoute(pathname) && pathname !== '/auth') {
          router.push('/auth');
        }
        return;
      }
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.data); // Access user data through data property based on backend response
        } else {
          // Invalid token
          localStorage.removeItem('token');
          setUser(null);
          
          // Redirect to login page if accessing protected routes
          if (isProtectedRoute(pathname) && pathname !== '/auth') {
            router.push('/auth');
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('token');
        setUser(null);
        
        // Redirect to login page if accessing protected routes
        if (isProtectedRoute(pathname) && pathname !== '/auth') {
          router.push('/auth');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [pathname, router]);
  
  // Handle role-based access
  useEffect(() => {
    if (!isLoading && user) {
      console.log('Role check with user:', user);
      console.log('Current path:', pathname);
      
      // Check if user tries to access a page they don't have permission for
      if (isRestrictedRoute(pathname)) {
        const requiredRoles = getRequiredRoles(pathname);
        console.log('Required roles for this route:', requiredRoles);
        
        if (requiredRoles.length > 0) {
          // More flexible role checking
          let hasRequiredRole = false;
          
          // Check direct role property
          if (user.role && requiredRoles.includes(user.role)) {
            hasRequiredRole = true;
          }
          
          // Check roles array if it exists
          if (user.roles) {
            const userRoles = Array.isArray(user.roles) 
              ? user.roles.map(r => typeof r === 'string' ? r : r.role) 
              : [];
            
            if (requiredRoles.some(role => userRoles.includes(role))) {
              hasRequiredRole = true;
            }
          }
          
          console.log('Has required role:', hasRequiredRole);
          
          if (!hasRequiredRole) {
            // Redirect to dashboard if user doesn't have required role
            console.log('Redirecting to dashboard due to lack of permission');
            router.push('/dashboard');
          }
        }
      }
    }
  }, [isLoading, user, pathname, router]);

  // Logout function
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/auth');
    }
  };
  
  // Determine if a route is protected (requires authentication)
  const isProtectedRoute = (path) => {
    const protectedRoutes = ['/dashboard', '/profile', '/lessons/create'];
    return protectedRoutes.some(route => path.startsWith(route));
  };
  
  // Determine if a route is restricted to certain roles
  const isRestrictedRoute = (path) => {
    return path.startsWith('/lessons/create') || 
           (path === '/lessons' && path.includes('edit'));
  };
  
  // Get required roles for a specific route
  const getRequiredRoles = (path) => {
    if (path.startsWith('/lessons/create') || (path === '/lessons' && path.includes('edit'))) {
      return ['teacher', 'admin'];
    }
    return [];
  };
  
  // Get user role in a more flexible way that handles different API response formats
  const getUserRole = (user) => {
    // Direct role property
    if (user?.role) {
      return user.role;
    }
    
    // Array of role objects with role property
    if (user?.roles && Array.isArray(user.roles)) {
      const roleObjects = user.roles.filter(r => r && (typeof r === 'string' || r.role));
      if (roleObjects.length > 0) {
        return typeof roleObjects[0] === 'string' ? roleObjects[0] : roleObjects[0].role;
      }
    }
    
    return null;
  };
  
  // Log the user for debugging
  useEffect(() => {
    if (user) {
      console.log("Current user for role detection:", user);
      console.log("User role detected as:", getUserRole(user));
    }
  }, [user]);
  
  // Compute role flags for easier checks - improved version
  const isTeacher = (
    user?.role === 'teacher' || 
    (user?.roles && Array.isArray(user.roles) && user.roles.some(role => 
      (typeof role === 'string' && role === 'teacher') || 
      (role && role.role === 'teacher')
    ))
  ) || false;
  
  const isAdmin = (
    user?.role === 'admin' || 
    (user?.roles && Array.isArray(user.roles) && user.roles.some(role => 
      (typeof role === 'string' && role === 'admin') || 
      (role && role.role === 'admin')
    ))
  ) || false;

  console.log("Final role check - isTeacher:", isTeacher, "isAdmin:", isAdmin);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isTeacher,
        isAdmin,
        isLoading,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}