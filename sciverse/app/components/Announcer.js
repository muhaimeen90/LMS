"use client";

import { useState, useEffect } from 'react';

/**
 * Accessible Announcer component for screen readers
 * This component is used to announce changes to screen readers without visual changes
 */
export default function Announcer() {
  const [announcement, setAnnouncement] = useState('');
  
  useEffect(() => {
    // Listen for custom announcement events
    const handleAnnouncement = (event) => {
      if (event.detail && typeof event.detail.message === 'string') {
        setAnnouncement(event.detail.message);
        
        // Clear announcement after screen reader has had time to read it
        setTimeout(() => {
          setAnnouncement('');
        }, 3000);
      }
    };
    
    document.addEventListener('announce', handleAnnouncement);
    
    return () => {
      document.removeEventListener('announce', handleAnnouncement);
    };
  }, []);
  
  // Helper function to announce messages (can be imported and used elsewhere)
  const announce = (message, assertiveness = 'polite') => {
    const event = new CustomEvent('announce', {
      detail: { message, assertiveness }
    });
    document.dispatchEvent(event);
  };
  
  // Expose the announce function to the window for use in other components
  useEffect(() => {
    window.announceToScreenReader = announce;
    return () => {
      delete window.announceToScreenReader;
    };
  }, []);
  
  return (
    <>
      {/* Polite announcements - won't interrupt the screen reader */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>
      
      {/* For important, immediate announcements */}
      <div 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>
    </>
  );
}
