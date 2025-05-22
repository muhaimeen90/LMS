"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../utils/AuthContext';

const Navigation = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout, isTeacher, isAdmin } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Define navigation items - some may be conditional based on auth status
  const getNavItems = () => {
    const items = [
      { name: 'Home', path: '/' },
    ];
    
    // Teacher-specific items
    if (isTeacher && isAuthenticated) {
      items.push({ name: 'Lessons', path: '/lessons' });
      items.push({ name: 'Create Lesson', path: '/lessons/create' });
      items.push({ name: 'Create Quiz', path: '/quizzes/create' });
      items.push({ name: 'Profile', path: '/profile' });
    } 
    // Regular student items
    else if (isAuthenticated) {
      items.push({ name: 'Lessons', path: '/lessons' });
      items.push({ name: 'Profile', path: '/profile' });
      items.push({ name: 'Dashboard', path: '/dashboard' });
    } 
    // Non-authenticated items
    else {
      items.push({ name: 'Lessons', path: '/lessons' });
    }
    
    // Common items for all users
    items.push({ name: 'Science Fact Checker', path: '/fact-checker' });
    items.push({ name: 'Accessibility', path: '/accessibility' });
    
    return items;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-blue-600 text-white py-4" aria-label="Main Navigation">
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="absolute left-0 -top-10 focus:top-0 z-50 bg-blue-700 p-2 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400" 
        aria-label="Skip to main content"
      >
        Skip to content
      </a>
      
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold" aria-label="SciVerse Home">
          SciVerse
        </Link>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex space-x-4">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`py-2 px-3 rounded transition-colors ${
                pathname === item.path 
                  ? 'bg-blue-700 font-semibold' 
                  : 'hover:bg-blue-500 focus:bg-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              aria-current={pathname === item.path ? 'page' : undefined}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Authentication buttons */}
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="py-2 px-3 rounded bg-red-500 hover:bg-red-600 focus:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  aria-label="Log out"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="py-2 px-3 rounded bg-green-500 hover:bg-green-600 focus:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  aria-label="Log in or sign up"
                >
                  Login / Signup
                </Link>
              )}
            </>
          )}
          
          {/* Show teacher/admin badge if applicable */}
          {isTeacher && (
            <span className="py-1 px-2 bg-yellow-500 text-yellow-900 text-xs font-semibold rounded">
              Teacher
            </span>
          )}
          {isAdmin && (
            <span className="py-1 px-2 bg-purple-500 text-white text-xs font-semibold rounded">
              Admin
            </span>
          )}
        </div>
        
        {/* Mobile menu button */}
        <button 
          onClick={toggleMenu} 
          className="md:hidden p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded" 
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <span className="sr-only">Menu</span>
          <svg 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <div 
            id="mobile-menu" 
            className="absolute top-16 left-0 right-0 bg-blue-600 z-50 md:hidden"
          >
            <div className="flex flex-col px-4 py-2">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`py-3 px-4 border-b border-blue-500 ${
                    pathname === item.path 
                      ? 'bg-blue-700 font-semibold' 
                      : 'hover:bg-blue-500 focus:bg-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                  aria-current={pathname === item.path ? 'page' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Authentication buttons for mobile */}
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="py-3 px-4 border-b border-blue-500 text-left bg-red-500 hover:bg-red-600 focus:bg-red-600"
                      aria-label="Log out"
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      href="/auth"
                      className="py-3 px-4 border-b border-blue-500 bg-green-500 hover:bg-green-600 focus:bg-green-600"
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Log in or sign up"
                    >
                      Login / Signup
                    </Link>
                  )}
                </>
              )}
              
              {/* Show role in mobile menu */}
              {(isTeacher || isAdmin) && (
                <div className="py-3 px-4 text-sm">
                  Role: {isAdmin ? 'Admin' : ''} {isTeacher ? 'Teacher' : ''}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
