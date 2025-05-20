"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { loadSettings, saveSettings, FONT_SIZES, THEMES } from '../utils/themeUtils';

// Create context
const ThemeContext = createContext({
  fontSize: FONT_SIZES.MEDIUM,
  theme: THEMES.LIGHT,
  setFontSize: () => {},
  setTheme: () => {},
});

// Provider component
export function ThemeProvider({ children }) {
  const [fontSize, setFontSizeState] = useState(FONT_SIZES.MEDIUM);
  const [theme, setThemeState] = useState(THEMES.LIGHT);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on initial mount
  useEffect(() => {
    const { fontSize: savedFontSize, theme: savedTheme } = loadSettings();
    setFontSizeState(savedFontSize);
    setThemeState(savedTheme);
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      saveSettings({ fontSize, theme });
      
      // Apply theme and font size classes to html/body elements
      const htmlElement = document.documentElement;
      
      // Remove all theme classes
      htmlElement.classList.remove('light', 'dark', 'high-contrast');
      
      // Add current theme class
      switch (theme) {
        case THEMES.DARK:
          htmlElement.classList.add('dark');
          break;
        case THEMES.HIGH_CONTRAST:
          htmlElement.classList.add('high-contrast');
          break;
        default:
          htmlElement.classList.add('light');
      }
      
      // Remove all font size classes
      htmlElement.classList.remove('text-sm', 'text-base', 'text-xl');
      
      // Add current font size class
      switch (fontSize) {
        case FONT_SIZES.SMALL:
          htmlElement.classList.add('text-sm');
          break;
        case FONT_SIZES.LARGE:
          htmlElement.classList.add('text-xl');
          break;
        default:
          htmlElement.classList.add('text-base');
      }
    }
  }, [fontSize, theme, isLoaded]);

  // Set font size and save to localStorage
  const setFontSize = (newSize) => {
    setFontSizeState(newSize);
  };

  // Set theme and save to localStorage
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  // Provide context value
  const contextValue = {
    fontSize,
    theme,
    setFontSize,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useTheme() {
  return useContext(ThemeContext);
}
