"use client";

/**
 * Utility for making announcements to screen readers
 * 
 * This is implemented as a global utility that can be called from any component
 * without needing to pass props or use context.
 */

// Create a live region for screen reader announcements if we're in the browser
if (typeof window !== 'undefined') {
  // Only create once
  if (!window.screenReaderAnnouncer) {
    // Create a div that will be announced by screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('class', 'sr-only');
    announcer.id = 'screen-reader-announcer';
    
    // Append to body when it's available
    if (document.body) {
      document.body.appendChild(announcer);
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(announcer);
      });
    }
    
    // Add the announcement function to the window object
    window.announceToScreenReader = (message, politeness = 'polite') => {
      const announcer = document.getElementById('screen-reader-announcer');
      if (announcer) {
        // Update the politeness setting
        announcer.setAttribute('aria-live', politeness);
        
        // Clear existing content first (this is important for some screen readers)
        announcer.textContent = '';
        
        // Set the new message after a brief delay to ensure it's announced
        setTimeout(() => {
          announcer.textContent = message;
        }, 50);
        
        // Log for debugging
        console.log(`Screen reader announcement (${politeness}): ${message}`);
      }
    };
  }
}

/**
 * Announce a message to screen readers
 * @param {string} message - The message to announce
 * @param {string} politeness - 'polite' (default) or 'assertive'
 */
export function announceToScreenReader(message, politeness = 'polite') {
  if (typeof window !== 'undefined' && window.announceToScreenReader) {
    window.announceToScreenReader(message, politeness);
  }
}

/**
 * Create a component that adds a screen reader announcer to the page
 */
export default function ScreenReaderAnnouncer() {
  // This component doesn't render anything visible
  return null;
}
