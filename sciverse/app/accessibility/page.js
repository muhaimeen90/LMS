"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { FONT_SIZES, THEMES } from '../utils/themeUtils';

export default function AccessibilityPage() {
  const { fontSize, theme, setFontSize, setTheme } = useTheme();
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Reset the settings changed message after 3 seconds
  useEffect(() => {
    let timer;
    if (settingsChanged) {
      timer = setTimeout(() => {
        setSettingsChanged(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [settingsChanged]);

  // Handle font size change
  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    setSettingsChanged(true);
  };

  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setSettingsChanged(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Accessibility Settings</h1>
        
        {settingsChanged && (
          <div 
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6" 
            role="alert"
            aria-live="polite"
          >
            <p>Your settings have been updated and saved!</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Display Preferences</h2>
            
            {/* Font Size Controls */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3" id="font-size-label">Font Size</h3>
              
              <div className="flex flex-wrap gap-4" role="radiogroup" aria-labelledby="font-size-label">
                <button
                  onClick={() => handleFontSizeChange(FONT_SIZES.SMALL)}
                  className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fontSize === FONT_SIZES.SMALL
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={fontSize === FONT_SIZES.SMALL}
                  aria-label="Small font size"
                >
                  <span className="text-sm">Small</span>
                </button>
                
                <button
                  onClick={() => handleFontSizeChange(FONT_SIZES.MEDIUM)}
                  className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fontSize === FONT_SIZES.MEDIUM
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={fontSize === FONT_SIZES.MEDIUM}
                  aria-label="Medium font size"
                >
                  <span className="text-base">Medium</span>
                </button>
                
                <button
                  onClick={() => handleFontSizeChange(FONT_SIZES.LARGE)}
                  className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    fontSize === FONT_SIZES.LARGE
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={fontSize === FONT_SIZES.LARGE}
                  aria-label="Large font size"
                >
                  <span className="text-lg">Large</span>
                </button>
              </div>
              
              <p className="text-gray-600 mt-2">
                Adjust the text size for better readability.
              </p>
            </div>
            
            {/* Theme Controls */}
            <div>
              <h3 className="text-lg font-medium mb-3" id="theme-label">Theme</h3>
              
              <div className="flex flex-wrap gap-4" role="radiogroup" aria-labelledby="theme-label">
                <button
                  onClick={() => handleThemeChange(THEMES.LIGHT)}
                  className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === THEMES.LIGHT
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={theme === THEMES.LIGHT}
                  aria-label="Light theme"
                >
                  Light
                </button>
                
                <button
                  onClick={() => handleThemeChange(THEMES.DARK)}
                  className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === THEMES.DARK
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={theme === THEMES.DARK}
                  aria-label="Dark theme"
                >
                  Dark
                </button>
                
                <button
                  onClick={() => handleThemeChange(THEMES.HIGH_CONTRAST)}
                  className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === THEMES.HIGH_CONTRAST
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={theme === THEMES.HIGH_CONTRAST}
                  aria-label="High contrast theme"
                >
                  High Contrast
                </button>
              </div>
              
              <p className="text-gray-600 mt-2">
                Choose a theme that works best for your visual preferences.
              </p>
            </div>
          </div>
        </div>
        
        {/* Accessibility Information */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">About Our Accessibility Features</h2>
          
          <div className="space-y-4">
            <p>
              SciVerse is built with accessibility in mind to ensure science education is accessible to everyone. Our features include:
            </p>
            
            <ul className="list-disc list-inside space-y-2">
              <li>Keyboard navigation for all interactive elements</li>
              <li>Screen reader compatibility with proper ARIA labels</li>
              <li>Customizable font sizes for better readability</li>
              <li>High contrast theme option</li>
              <li>Responsive design for all device sizes</li>
              <li>Semantic HTML structure</li>
            </ul>
            
            <p>
              We are committed to following WCAG 2.1 guidelines to provide the best possible experience for all users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
