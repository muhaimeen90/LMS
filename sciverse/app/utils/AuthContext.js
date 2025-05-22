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

// Safe localStorage access function
const safeLocalStorage = {
  getItem: (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const token = safeLocalStorage.getItem('token');
      
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.data); // Access user data through data property based on backend response
        } else {
          // Invalid token
          safeLocalStorage.removeItem('token');
          setUser(null);
          
          // Redirect to login page if accessing protected routes
          if (isProtectedRoute(pathname) && pathname !== '/auth') {
            router.push('/auth');
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        safeLocalStorage.removeItem('token');
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
      // Check if user tries to access a page they don't have permission for
      if (isRestrictedRoute(pathname)) {
        const requiredRoles = getRequiredRoles(pathname);
        
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
          
          if (!hasRequiredRole) {
            // Redirect to dashboard if user doesn't have required role
            router.push('/dashboard');
          }
        }
      }
    }
  }, [isLoading, user, pathname, router]);

  // Logout function
  const logout = async () => {
    try {
      const token = safeLocalStorage.getItem('token');
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      safeLocalStorage.removeItem('token');
      safeLocalStorage.removeItem('user');
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