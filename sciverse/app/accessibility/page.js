"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { FONT_SIZES, THEMES, MOTION_PREFERENCES, TEXT_SPACING, COLOR_BLINDNESS_MODES } from '../utils/themeUtils';
import AccessibilityGuide from '../components/AccessibilityGuide';

export default function AccessibilityPage() {
  const { 
    fontSize, 
    theme,
    motion,
    textSpacing,
    dyslexicFont,
    colorBlindnessMode,
    setFontSize, 
    setTheme,
    setMotion,
    setTextSpacing,
    setDyslexicFont,
    setColorBlindnessMode
  } = useTheme();
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
  
  // Handle motion preference change
  const handleMotionChange = (newMotion) => {
    setMotion(newMotion);
    setSettingsChanged(true);
  };
  
  // Handle text spacing change
  const handleTextSpacingChange = (newSpacing) => {
    setTextSpacing(newSpacing);
    setSettingsChanged(true);
  };
  
  // Handle dyslexic font toggle
  const handleDyslexicFontChange = (enabled) => {
    setDyslexicFont(enabled);
    setSettingsChanged(true);
  };
  
  // Handle color blindness mode change
  const handleColorBlindnessModeChange = (newMode) => {
    setColorBlindnessMode(newMode);
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
            
            {/* Font Size */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Font Size</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFontSizeChange(FONT_SIZES.SMALL)}
                  className={`px-4 py-2 rounded-md ${
                    fontSize === FONT_SIZES.SMALL
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={fontSize === FONT_SIZES.SMALL}
                >
                  Small
                </button>
                <button
                  onClick={() => handleFontSizeChange(FONT_SIZES.MEDIUM)}
                  className={`px-4 py-2 rounded-md ${
                    fontSize === FONT_SIZES.MEDIUM
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={fontSize === FONT_SIZES.MEDIUM}
                >
                  Medium
                </button>
                <button
                  onClick={() => handleFontSizeChange(FONT_SIZES.LARGE)}
                  className={`px-4 py-2 rounded-md ${
                    fontSize === FONT_SIZES.LARGE
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={fontSize === FONT_SIZES.LARGE}
                >
                  Large
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                You can also use keyboard shortcuts: Ctrl+Alt+1 (decrease) and Ctrl+Alt+2 (increase)
              </p>
            </div>
            
            {/* Theme */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Theme</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleThemeChange(THEMES.LIGHT)}
                  className={`px-4 py-2 rounded-md ${
                    theme === THEMES.LIGHT
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={theme === THEMES.LIGHT}
                >
                  Light
                </button>
                <button
                  onClick={() => handleThemeChange(THEMES.DARK)}
                  className={`px-4 py-2 rounded-md ${
                    theme === THEMES.DARK
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={theme === THEMES.DARK}
                >
                  Dark
                </button>
                <button
                  onClick={() => handleThemeChange(THEMES.HIGH_CONTRAST)}
                  className={`px-4 py-2 rounded-md ${
                    theme === THEMES.HIGH_CONTRAST
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={theme === THEMES.HIGH_CONTRAST}
                >
                  High Contrast
                </button>
              </div>
            </div>
            
            {/* Motion Preferences */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Motion Effects</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleMotionChange(MOTION_PREFERENCES.FULL)}
                  className={`px-4 py-2 rounded-md ${
                    motion === MOTION_PREFERENCES.FULL
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={motion === MOTION_PREFERENCES.FULL}
                >
                  Full
                </button>
                <button
                  onClick={() => handleMotionChange(MOTION_PREFERENCES.REDUCED)}
                  className={`px-4 py-2 rounded-md ${
                    motion === MOTION_PREFERENCES.REDUCED
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={motion === MOTION_PREFERENCES.REDUCED}
                >
                  Reduced
                </button>
                <button
                  onClick={() => handleMotionChange(MOTION_PREFERENCES.NONE)}
                  className={`px-4 py-2 rounded-md ${
                    motion === MOTION_PREFERENCES.NONE
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={motion === MOTION_PREFERENCES.NONE}
                >
                  None
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Reduced motion minimizes animations, while None disables all animations and transitions.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Reading Preferences</h2>
            
            {/* Text Spacing */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Text Spacing</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTextSpacingChange(TEXT_SPACING.NORMAL)}
                  className={`px-4 py-2 rounded-md ${
                    textSpacing === TEXT_SPACING.NORMAL
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={textSpacing === TEXT_SPACING.NORMAL}
                >
                  Normal
                </button>
                <button
                  onClick={() => handleTextSpacingChange(TEXT_SPACING.WIDE)}
                  className={`px-4 py-2 rounded-md ${
                    textSpacing === TEXT_SPACING.WIDE
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={textSpacing === TEXT_SPACING.WIDE}
                >
                  Wide
                </button>
                <button
                  onClick={() => handleTextSpacingChange(TEXT_SPACING.WIDER)}
                  className={`px-4 py-2 rounded-md ${
                    textSpacing === TEXT_SPACING.WIDER
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={textSpacing === TEXT_SPACING.WIDER}
                >
                  Wider
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Increased text spacing can help with readability, especially for users with dyslexia or visual processing disorders.
              </p>
            </div>
            
            {/* Dyslexic Font */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Dyslexic-Friendly Font</h3>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={dyslexicFont}
                      onChange={(e) => handleDyslexicFontChange(e.target.checked)}
                    />
                    <div className={`block w-14 h-8 rounded-full ${dyslexicFont ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${dyslexicFont ? 'transform translate-x-6' : ''}`}></div>
                  </div>                  <div className="ml-3 text-gray-700 font-medium">
                    Use Dyslexia-Friendly Font
                  </div>
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Lexend Deca is a typeface designed to increase readability for readers with dyslexia.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Color Vision</h2>
            <p className="mb-4">These settings simulate different types of color vision deficiencies to help you understand how users with color blindness may see your content.</p>
            
            {/* Color Blindness Modes */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Color Blindness Simulation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleColorBlindnessModeChange(COLOR_BLINDNESS_MODES.NORMAL)}
                  className={`px-4 py-2 rounded-md ${
                    colorBlindnessMode === COLOR_BLINDNESS_MODES.NORMAL
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={colorBlindnessMode === COLOR_BLINDNESS_MODES.NORMAL}
                >
                  Normal Vision
                </button>
                <button
                  onClick={() => handleColorBlindnessModeChange(COLOR_BLINDNESS_MODES.PROTANOPIA)}
                  className={`px-4 py-2 rounded-md ${
                    colorBlindnessMode === COLOR_BLINDNESS_MODES.PROTANOPIA
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={colorBlindnessMode === COLOR_BLINDNESS_MODES.PROTANOPIA}
                >
                  Protanopia (Red-Blind)
                </button>
                <button
                  onClick={() => handleColorBlindnessModeChange(COLOR_BLINDNESS_MODES.DEUTERANOPIA)}
                  className={`px-4 py-2 rounded-md ${
                    colorBlindnessMode === COLOR_BLINDNESS_MODES.DEUTERANOPIA
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={colorBlindnessMode === COLOR_BLINDNESS_MODES.DEUTERANOPIA}
                >
                  Deuteranopia (Green-Blind)
                </button>
                <button
                  onClick={() => handleColorBlindnessModeChange(COLOR_BLINDNESS_MODES.TRITANOPIA)}
                  className={`px-4 py-2 rounded-md ${
                    colorBlindnessMode === COLOR_BLINDNESS_MODES.TRITANOPIA
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={colorBlindnessMode === COLOR_BLINDNESS_MODES.TRITANOPIA}
                >
                  Tritanopia (Blue-Blind)
                </button>
                <button
                  onClick={() => handleColorBlindnessModeChange(COLOR_BLINDNESS_MODES.ACHROMATOPSIA)}
                  className={`px-4 py-2 rounded-md ${
                    colorBlindnessMode === COLOR_BLINDNESS_MODES.ACHROMATOPSIA
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  aria-pressed={colorBlindnessMode === COLOR_BLINDNESS_MODES.ACHROMATOPSIA}
                >
                  Achromatopsia (Monochromacy)
                </button>
              </div>
            </div>
          </div>
        </div>
          <AccessibilityGuide />
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Accessibility Resources</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <a 
                  href="https://www.w3.org/WAI/standards-guidelines/wcag/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Web Content Accessibility Guidelines (WCAG)
                </a>
              </li>
              <li>
                <a 
                  href="https://www.w3.org/WAI/ARIA/apg/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  WAI-ARIA Authoring Practices
                </a>
              </li>
              <li>
                <a 
                  href="https://developer.mozilla.org/en-US/docs/Web/Accessibility" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  MDN Web Accessibility Guide
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
