"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Lessons', path: '/lessons' },
    { name: 'Science Fact Checker', path: '/fact-checker' },
    { name: 'Accessibility', path: '/accessibility' },
    { name: 'Profile', path: '/profile' },
  ];

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
        
        {/* Desktop navigation */}
        <div className="hidden md:flex space-x-6">
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
        </div>
        
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
