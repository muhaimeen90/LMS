"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function useKeyboardShortcuts() {
  const pathname = usePathname();
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't activate shortcuts when user is typing in form fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Only activate shortcuts when using Control+Alt (Option) modifiers
      if (e.ctrlKey && e.altKey) {
        switch (e.key) {
          case 'h': // Home
            window.location.href = '/';
            break;
          case 'l': // Lessons
            window.location.href = '/lessons';
            break;
          case 'f': // Fact Checker
            window.location.href = '/fact-checker';
            break;
          case 'a': // Accessibility
            window.location.href = '/accessibility';
            break;
          case 'p': // Profile
            window.location.href = '/profile';
            break;
          case 's': // Skip to content
            document.getElementById('main-content')?.focus();
            break;
          case 'm': // Main menu
            document.querySelector('nav a')?.focus();
            break;
          case '1': // Increase font size
            document.dispatchEvent(new CustomEvent('increaseFontSize'));
            break;
          case '2': // Decrease font size
            document.dispatchEvent(new CustomEvent('decreaseFontSize'));
            break;
          case 'd': // Toggle dark mode
            document.dispatchEvent(new CustomEvent('toggleDarkMode'));
            break;
          case 'c': // Toggle high contrast
            document.dispatchEvent(new CustomEvent('toggleHighContrast'));
            break;
          default:
            return; // Do nothing for other keys
        }
        e.preventDefault(); // Prevent default browser behavior
      }
      
      // Lesson-specific shortcuts - only activate in lesson pages
      if (pathname?.includes('/lessons/') && !/^\/lessons\/?$/.test(pathname)) {
        // Special handling for tab switching with Alt+number (without Ctrl)
        if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
          switch (e.key) {
            case '1': // Switch to content tab
              document.getElementById('content-tab')?.click();
              e.preventDefault();
              break;
            case '2': // Switch to quiz tab
              document.getElementById('quiz-tab')?.click();
              e.preventDefault();
              break;
            case '3': // Switch to interactive tab
              document.getElementById('interactive-tab')?.click();
              e.preventDefault();
              break;
            default:
              break;
          }
        }
        
        // For left/right arrow navigation between lesson sections,
        // this is handled directly in the lesson component to maintain state
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pathname]);

  return null; // This hook doesn't render anything
}
