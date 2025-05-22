"use client";

/**
 * Utilities for enhancing accessibility in lesson content
 */

/**
 * Extracts plain text from HTML content for use with screen readers
 * @param {string} html - HTML content
 * @returns {string} - Plain text content
 */
export const extractTextFromHtml = (html) => {
  if (!html) return '';
  
  // Create a temporary DOM element to parse HTML
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove any script tags for security
    const scripts = tempDiv.getElementsByTagName('script');
    while (scripts[0]) {
      scripts[0].parentNode.removeChild(scripts[0]);
    }
    
    // Get the text content
    return tempDiv.textContent || tempDiv.innerText || '';
  }
  
  // Simple fallback for server-side rendering
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * Enhances HTML content with improved accessibility features
 * @param {string} html - HTML content
 * @returns {string} - Enhanced HTML content with improved accessibility
 */
export const enhanceHtmlAccessibility = (html) => {
  if (!html) return '';
  
  // For server-side rendering, we'll do simple string replacements
  // In a more robust implementation, this would use a proper HTML parser
  
  // Add missing alt attributes to images
  html = html.replace(/<img([^>]*)>/gi, (match, attributes) => {
    if (!attributes.includes('alt=')) {
      return `<img${attributes} alt="Lesson image">`;
    }
    return match;
  });
  
  // Make tables more accessible
  html = html.replace(/<table([^>]*)>/gi, '<table$1 role="grid">');
  
  // Enhance links with ARIA attributes when they open in new windows
  html = html.replace(/<a([^>]*)target="_blank"([^>]*)>/gi, 
    '<a$1target="_blank"$2 aria-label="Opens in a new window" rel="noopener noreferrer">');
    
  return html;
};

/**
 * Announce section changes to screen readers
 * @param {Object} section - The section object with title and content
 * @param {number} index - The section index (0-based)
 * @param {number} total - The total number of sections
 */
export const announceSection = (section, index, total) => {
  if (!section || typeof window === 'undefined') return;
  
  const message = `Section ${index + 1} of ${total}: ${section.title}`;
  
  if (window.announceToScreenReader) {
    window.announceToScreenReader(message, 'polite');
  }
};

/**
 * Announce quiz results to screen readers
 * @param {number} score - The quiz score (percentage)
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total number of questions
 */
export const announceQuizResults = (score, correct, total) => {
  if (typeof window === 'undefined') return;
  
  const message = `Quiz completed. You got ${correct} out of ${total} questions correct. Your score is ${score} percent.`;
  
  if (window.announceToScreenReader) {
    window.announceToScreenReader(message, 'assertive');
  }
};

/**
 * Registers keyboard navigation shortcuts for lessons
 * @param {Function} nextCallback - Callback for next section
 * @param {Function} prevCallback - Callback for previous section
 * @param {Function} tabCallback - Callback for tab switching
 * @returns {Function} - Cleanup function
 */
export const registerLessonKeyboardShortcuts = (nextCallback, prevCallback, tabCallback) => {
  if (typeof window === 'undefined') return () => {};
  
  const handleKeyDown = (e) => {
    // Skip if focus is on input elements
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    // Next/previous with arrow keys
    if (e.key === 'ArrowRight' && nextCallback) {
      e.preventDefault();
      nextCallback();
    } else if (e.key === 'ArrowLeft' && prevCallback) {
      e.preventDefault();
      prevCallback();
    }
    
    // Tab switching with Alt + number
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        e.preventDefault();
        const tabIndex = parseInt(e.key, 10) - 1;
        if (tabCallback) {
          tabCallback(tabIndex);
        }
      }
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};
