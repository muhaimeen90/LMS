"use client";

import { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { FONT_SIZES, THEMES, MOTION_PREFERENCES, TEXT_SPACING } from '../utils/themeUtils';

export default function AccessibilityPanel({ showLabel = true }) {
  const { 
    fontSize, 
    theme, 
    motion,
    textSpacing,
    dyslexicFont,
    setFontSize, 
    setTheme,
    setMotion,
    setTextSpacing,
    setDyslexicFont 
  } = useTheme();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('display');

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
    
    if (!isPanelOpen) {
      // Announce panel opening to screen readers
      window.announceToScreenReader?.("Accessibility panel opened");
    }
  };

  return (
    <div className="accessibility-controls fixed bottom-4 right-4 z-50">
      <button
        onClick={togglePanel}
        className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-expanded={isPanelOpen}
        aria-controls="accessibility-panel"
        aria-label="Toggle accessibility panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {showLabel && (
          <span className="sr-only">Accessibility Controls</span>
        )}
      </button>

      {isPanelOpen && (
        <div
          id="accessibility-panel"
          className="bg-card absolute bottom-16 right-0 p-4 rounded-lg shadow-lg w-80 border border-gray-200"
          role="region"
          aria-label="Accessibility options"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Accessibility</h3>
            <button 
              onClick={togglePanel}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 p-1 rounded-md"
              aria-label="Close accessibility panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Panel Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('display')}
              className={`py-2 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t-md ${
                activeTab === 'display'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-selected={activeTab === 'display'}
              aria-controls="display-panel"
              id="display-tab"
            >
              Display
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`py-2 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t-md ${
                activeTab === 'text'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-selected={activeTab === 'text'}
              aria-controls="text-panel"
              id="text-tab"
            >
              Text
            </button>
            <button
              onClick={() => setActiveTab('motion')}
              className={`py-2 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t-md ${
                activeTab === 'motion'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-selected={activeTab === 'motion'}
              aria-controls="motion-panel"
              id="motion-tab"
            >
              Motion
            </button>
          </div>
          
          {/* Display Settings Panel */}
          <div
            id="display-panel"
            role="tabpanel"
            aria-labelledby="display-tab"
            className={activeTab === 'display' ? 'block' : 'hidden'}
          >
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Theme</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTheme(THEMES.LIGHT)}
                  className={`p-2 rounded-md ${theme === THEMES.LIGHT ? 'bg-primary text-white' : 'bg-gray-200'}`}
                  aria-pressed={theme === THEMES.LIGHT}
                  aria-label="Light theme"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => setTheme(THEMES.DARK)}
                  className={`p-2 rounded-md ${theme === THEMES.DARK ? 'bg-primary text-white' : 'bg-gray-200'}`}
                  aria-pressed={theme === THEMES.DARK}
                  aria-label="Dark theme"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </button>
                <button
                  onClick={() => setTheme(THEMES.HIGH_CONTRAST)}
                  className={`p-2 rounded-md ${theme === THEMES.HIGH_CONTRAST ? 'bg-primary text-white' : 'bg-gray-200'}`}
                  aria-pressed={theme === THEMES.HIGH_CONTRAST}
                  aria-label="High contrast theme"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Text Settings Panel */}
          <div
            id="text-panel"
            role="tabpanel"
            aria-labelledby="text-tab"
            className={activeTab === 'text' ? 'block' : 'hidden'}
          >
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Font Size</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFontSize(FONT_SIZES.SMALL)}
                  className={`p-2 rounded-md ${fontSize === FONT_SIZES.SMALL ? 'bg-primary text-white' : 'bg-gray-200'}`}
                  aria-pressed={fontSize === FONT_SIZES.SMALL}
                  aria-label="Small font size"
                >
                  <span className="text-xs">A</span>
                </button>
                <button
                  onClick={() => setFontSize(FONT_SIZES.MEDIUM)}
                  className={`p-2 rounded-md ${fontSize === FONT_SIZES.MEDIUM ? 'bg-primary text-white' : 'bg-gray-200'}`}
                  aria-pressed={fontSize === FONT_SIZES.MEDIUM}
                  aria-label="Medium font size"
                >
                  <span className="text-sm">A</span>
                </button>
                <button
                  onClick={() => setFontSize(FONT_SIZES.LARGE)}
                  className={`p-2 rounded-md ${fontSize === FONT_SIZES.LARGE ? 'bg-primary text-white' : 'bg-gray-200'}`}
                  aria-pressed={fontSize === FONT_SIZES.LARGE}
                  aria-label="Large font size"
                >
                  <span className="text-base">A</span>
                </button>
              </div>
            </div>
              <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Text Spacing</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTextSpacing(TEXT_SPACING.NORMAL)}
                  className={`px-4 py-2 rounded-md border ${
                    textSpacing === TEXT_SPACING.NORMAL
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-800 border-gray-300'
                  }`}
                  aria-pressed={textSpacing === TEXT_SPACING.NORMAL}
                  aria-label="Normal text spacing"
                >
                  Normal
                </button>
                <button
                  onClick={() => setTextSpacing(TEXT_SPACING.WIDE)}
                  className={`px-4 py-2 rounded-md border ${
                    textSpacing === TEXT_SPACING.WIDE
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-800 border-gray-300'
                  }`}
                  aria-pressed={textSpacing === TEXT_SPACING.WIDE}
                  aria-label="Wide text spacing"
                >
                  Wide
                </button>
                <button
                  onClick={() => setTextSpacing(TEXT_SPACING.WIDER)}
                  className={`px-4 py-2 rounded-md border ${
                    textSpacing === TEXT_SPACING.WIDER
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-800 border-gray-300'
                  }`}
                  aria-pressed={textSpacing === TEXT_SPACING.WIDER}
                  aria-label="Wider text spacing"
                >
                  Wider
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Dyslexic Font</h4>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary"
                  checked={dyslexicFont}
                  onChange={(e) => setDyslexicFont(e.target.checked)}                  aria-label="Use dyslexic-friendly font"
                />
                <span className="ml-2 text-gray-700">Use dyslexia-friendly font</span>
              </label>
            </div>
          </div>
          
          {/* Motion Settings Panel */}
          <div
            id="motion-panel"
            role="tabpanel"
            aria-labelledby="motion-tab"
            className={activeTab === 'motion' ? 'block' : 'hidden'}
          >            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Motion Effects</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMotion(MOTION_PREFERENCES.FULL)}
                  className={`px-4 py-2 rounded-md border ${
                    motion === MOTION_PREFERENCES.FULL
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-800 border-gray-300'
                  }`}
                  aria-pressed={motion === MOTION_PREFERENCES.FULL}
                  aria-label="Normal animations"
                >
                  Normal
                </button>
                <button
                  onClick={() => setMotion(MOTION_PREFERENCES.REDUCED)}
                  className={`px-4 py-2 rounded-md border ${
                    motion === MOTION_PREFERENCES.REDUCED
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-800 border-gray-300'
                  }`}
                  aria-pressed={motion === MOTION_PREFERENCES.REDUCED}
                  aria-label="Reduced animations"
                >
                  Reduced
                </button>
                <button
                  onClick={() => setMotion(MOTION_PREFERENCES.NONE)}
                  className={`px-4 py-2 rounded-md border ${
                    motion === MOTION_PREFERENCES.NONE
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-800 border-gray-300'
                  }`}
                  aria-pressed={motion === MOTION_PREFERENCES.NONE}
                  aria-label="No animations"
                >
                  None
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Controls animations and transitions across the site.
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <a
              href="/accessibility"
              className="text-primary text-sm hover:underline focus:outline-none focus:underline"
            >
              More accessibility settings
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
