"use client";

import { useState } from 'react';

/**
 * Displays an accessibility statement for lesson content
 */
export default function LessonAccessibilityInfo() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-6">
      <button
        onClick={toggleExpand}
        className="w-full text-left font-medium flex justify-between items-center text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        aria-expanded={isExpanded}
        aria-controls="accessibility-info-content"
      >
        <span className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Lesson Accessibility Information
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div id="accessibility-info-content" className="mt-3">
          <h3 className="text-lg font-semibold mb-2">Navigating This Lesson</h3>
          
          <ul className="list-disc list-inside space-y-2 text-blue-800">
            <li>
              <strong>Keyboard Navigation:</strong> Use left and right arrow keys to move between lesson sections.
            </li>
            <li>
              <strong>Tab Switching:</strong> Press Alt+1 for Lesson Content, Alt+2 for Quiz, Alt+3 for Interactive Elements.
            </li>
            <li>
              <strong>Screen Reader Support:</strong> All content includes proper ARIA attributes and follows semantic HTML structure.
            </li>
            <li>
              <strong>Content Outline:</strong> Use the section outline above to quickly navigate to specific parts of the content.
            </li>
            <li>
              <strong>Customization:</strong> Access the floating accessibility panel in the bottom-right corner to adjust font size, spacing, and more.
            </li>
          </ul>
          
          <div className="mt-3">
            <p className="text-blue-800">
              If you encounter any accessibility issues or have suggestions for improvement, please contact us at <a href="mailto:accessibility@sciverse.edu" className="underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500">accessibility@sciverse.edu</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
