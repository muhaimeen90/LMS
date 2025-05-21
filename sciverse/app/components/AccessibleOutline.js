"use client";

import { useState, useEffect } from 'react';
import { extractHeadings } from '../utils/accessibleContentParser';

/**
 * Provides an accessible outline of content based on headings
 * @param {Object} props - Component props
 * @param {string} props.htmlContent - The HTML content to extract headings from
 * @param {string} props.title - The title of the outline
 * @param {Function} props.onHeadingClick - Optional callback for when a heading is clicked
 */
export default function AccessibleOutline({ htmlContent, title = "Content Outline", onHeadingClick }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [headings, setHeadings] = useState([]);
  
  // Extract headings from content
  useEffect(() => {
    if (htmlContent) {
      setHeadings(extractHeadings(htmlContent));
    }
  }, [htmlContent]);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    
    // Announce expansion state to screen readers
    if (typeof window !== 'undefined' && window.announceToScreenReader) {
      window.announceToScreenReader(
        isExpanded ? 'Content outline collapsed' : 'Content outline expanded'
      );
    }
  };
  
  const handleHeadingClick = (heading) => {
    // Find the corresponding heading element in the DOM
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
        
        // Add temporary highlight effect
        const originalBgColor = foundElement.style.backgroundColor;
        const originalTransition = foundElement.style.transition;
        
        foundElement.style.backgroundColor = '#facc15'; // Yellow highlight
        foundElement.style.transition = 'background-color 1s ease';
        
        // Set focus for keyboard users
        foundElement.setAttribute('tabindex', '-1');
        foundElement.focus({ preventScroll: true });
        
        // Announce to screen readers
        if (typeof window !== 'undefined' && window.announceToScreenReader) {
          window.announceToScreenReader(`Jumped to section: ${heading.text}`);
        }
        
        // Remove highlight after animation
        setTimeout(() => {
          foundElement.style.backgroundColor = originalBgColor;
          foundElement.style.transition = originalTransition;
        }, 1500);
      }
      
      if (onHeadingClick) {
        onHeadingClick(heading);
      }
    }
  };
  
  if (!headings || headings.length === 0) {
    return null;
  }
  
  return (
    <div className="border border-gray-200 rounded-md mb-4">
      <button
        onClick={toggleExpand}
        className="w-full p-3 text-left font-medium flex justify-between items-center bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t-md"
        aria-expanded={isExpanded}
        aria-controls="outline-contents"
      >
        <span>{title}</span>
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
        <div id="outline-contents" className="p-3">
          <nav aria-label="Content outline">
            <ul className="list-none space-y-1">
              {headings.map((heading, index) => (
                <li 
                  key={index}
                  style={{ paddingLeft: `${(heading.level - 1) * 1}rem` }}
                >
                  <button
                    onClick={() => handleHeadingClick(heading)}
                    className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 py-0.5 text-left w-full text-left truncate"
                    title={heading.text}
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
