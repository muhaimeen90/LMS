"use client";

import { useEffect } from 'react';

// This component demonstrates how to use the screen reader announcer utility
export default function ScreenReaderTest() {
  const testAnnouncement = (politeness = 'polite') => {
    if (typeof window !== 'undefined' && window.announceToScreenReader) {
      window.announceToScreenReader(`This is a ${politeness} announcement test for screen readers.`, politeness);
    } else {
      console.warn('Screen reader announcer not available');
    }
  };

  useEffect(() => {
    // Add the window methods for the screen reader test if they don't exist
    if (typeof window !== 'undefined' && !window.announceToScreenReader) {
      // Import the screen reader announcer utility
      import('../utils/screenReaderAnnouncer');
    }
  }, []);

  return (
    <div className="p-4 border rounded-md bg-white mb-6">
      <h2 className="text-xl font-semibold mb-3">Screen Reader Announcer Test</h2>
      <p className="mb-4">
        Test if screen reader announcements are working correctly. Click the buttons below to trigger an announcement that should be read by your screen reader.
      </p>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => testAnnouncement('polite')}
          className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Test Polite Announcement
        </button>
        
        <button
          onClick={() => testAnnouncement('assertive')}
          className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Test Assertive Announcement
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Polite announcements</strong> are used for non-critical updates and will wait until the screen reader finishes the current speech before announcing.
        </p>
        <p className="mt-1">
          <strong>Assertive announcements</strong> are used for important information that should interrupt the current speech.
        </p>
      </div>
    </div>
  );
}
