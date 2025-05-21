"use client";

import { useState, useRef, useEffect } from 'react';
import { extractHeadings } from '../utils/accessibleContentParser';

/**
 * A floating toolbar with accessibility controls for lesson navigation
 */
export default function LessonNavigationAssistant({ 
  htmlContent,
  onJumpToSection,
  currentSection,
  totalSections,
  onPrevSection,
  onNextSection
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [headings, setHeadings] = useState([]);
  const wrapperRef = useRef(null);
  
  // Extract headings when content changes
  useEffect(() => {
    if (htmlContent) {
      setHeadings(extractHeadings(htmlContent));
    }
  }, [htmlContent]);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      window.announceToScreenReader?.("Navigation assistant opened");
    }
  };
    const handleJumpToHeading = (heading) => {
    // Find the element based on heading text and scroll to it
    if (typeof document !== 'undefined') {
      const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let foundElement = null;
      
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].textContent.trim() === heading.text.trim()) {
          foundElement = elements[i];
          break;
        }
      }
      
      if (foundElement) {
        // Smooth scroll to the element
        foundElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Add temporary highlight effect to make it easier to identify
        const originalBgColor = foundElement.style.backgroundColor;
        const originalTransition = foundElement.style.transition;
        
        foundElement.style.backgroundColor = '#facc15'; // Yellow highlight
        foundElement.style.transition = 'background-color 1s ease';
        
        // Set focus for keyboard users
        foundElement.setAttribute('tabindex', '-1');
        foundElement.focus({ preventScroll: true });
        
        // Announce to screen readers
        window.announceToScreenReader?.(`Jumped to section: ${heading.text}`);
        
        // Remove highlight after animation
        setTimeout(() => {
          foundElement.style.backgroundColor = originalBgColor;
          foundElement.style.transition = originalTransition;
        }, 1500);
      }
    }
  };
    return (
    <div 
      className="fixed left-4 bottom-4 z-40"
      ref={wrapperRef}
    >
      <button
        onClick={toggleExpand}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform duration-200 hover:scale-110"
        aria-expanded={isExpanded}
        aria-label="Toggle navigation assistant"
        title="Navigation assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {isExpanded && (
        <div 
          className="absolute bottom-16 left-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-fade-in-up"
          style={{animation: 'fadeInUp 0.3s ease-out'}}
        >
          <div className="p-3 bg-blue-50 border-b border-gray-200">
            <h3 className="font-medium text-blue-800">Navigation Assistant</h3>
          </div>
          
          <div className="p-3">
            <div className="flex justify-between mb-3">
              <button
                onClick={onPrevSection}
                disabled={currentSection === 0}
                className={`px-3 py-1 rounded ${
                  currentSection === 0 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
                aria-label="Go to previous section"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="text-sm text-gray-600">
                Section {currentSection + 1} of {totalSections}
              </span>
              
              <button
                onClick={onNextSection}
                disabled={currentSection === totalSections - 1}
                className={`px-3 py-1 rounded ${
                  currentSection === totalSections - 1 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
                aria-label="Go to next section"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {headings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Jump to Heading:
                </h4>
                
                <div className="max-h-40 overflow-y-auto">
                  <ul className="space-y-1">
                    {headings.map((heading, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleJumpToHeading(heading)}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-left text-sm focus:outline-none focus:underline"
                          style={{ marginLeft: `${(heading.level - 1) * 0.75}rem` }}
                        >
                          {heading.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={toggleExpand}
                className="w-full bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Close Assistant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
