"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  loadSettings, 
  saveSettings, 
  FONT_SIZES, 
  THEMES, 
  MOTION_PREFERENCES, 
  TEXT_SPACING,
  COLOR_BLINDNESS_MODES
} from '../utils/themeUtils';

// Create context
const ThemeContext = createContext({
  fontSize: FONT_SIZES.MEDIUM,
  theme: THEMES.LIGHT,
  motion: MOTION_PREFERENCES.FULL,
  textSpacing: TEXT_SPACING.NORMAL,
  dyslexicFont: false,
  colorBlindnessMode: COLOR_BLINDNESS_MODES.NORMAL,
  setFontSize: () => {},
  setTheme: () => {},
  setMotion: () => {},
  setTextSpacing: () => {},
  setDyslexicFont: () => {},
  setColorBlindnessMode: () => {},
});

// Provider component
export function ThemeProvider({ children }) {
  const [fontSize, setFontSizeState] = useState(FONT_SIZES.MEDIUM);
  const [theme, setThemeState] = useState(THEMES.LIGHT);
  const [motion, setMotionState] = useState(MOTION_PREFERENCES.FULL);
  const [textSpacing, setTextSpacingState] = useState(TEXT_SPACING.NORMAL);
  const [dyslexicFont, setDyslexicFontState] = useState(false);
  const [colorBlindnessMode, setColorBlindnessModeState] = useState(COLOR_BLINDNESS_MODES.NORMAL);
  const [isLoaded, setIsLoaded] = useState(false);
  // Load settings from localStorage on initial mount
  useEffect(() => {
    const { 
      fontSize: savedFontSize, 
      theme: savedTheme,
      motion: savedMotion,
      textSpacing: savedTextSpacing,
      dyslexicFont: savedDyslexicFont,
      colorBlindnessMode: savedColorBlindnessMode
    } = loadSettings();
    
    setFontSizeState(savedFontSize);
    setThemeState(savedTheme);
    setMotionState(savedMotion);
    setTextSpacingState(savedTextSpacing);
    setDyslexicFontState(savedDyslexicFont);
    setColorBlindnessModeState(savedColorBlindnessMode);
    setIsLoaded(true);
  }, []);
  // Save settings to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      saveSettings({ 
        fontSize, 
        theme,
        motion,
        textSpacing,
        dyslexicFont,
        colorBlindnessMode
      });
      
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
      
      // Motion preferences
      htmlElement.classList.remove('reduced-motion', 'no-motion');
      if (motion === MOTION_PREFERENCES.REDUCED) {
        htmlElement.classList.add('reduced-motion');
      } else if (motion === MOTION_PREFERENCES.NONE) {
        htmlElement.classList.add('no-motion');
      }
      
      // Text spacing
      htmlElement.classList.remove('text-spacing-wide', 'text-spacing-wider');
      if (textSpacing === TEXT_SPACING.WIDE) {
        htmlElement.classList.add('text-spacing-wide');
      } else if (textSpacing === TEXT_SPACING.WIDER) {
        htmlElement.classList.add('text-spacing-wider');
      }
        // Dyslexic font
      if (dyslexicFont) {
        htmlElement.classList.add('dyslexic-font');
      } else {
        htmlElement.classList.remove('dyslexic-font');
      }
      
      // Color blindness modes
      htmlElement.classList.remove('protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia');
      if (colorBlindnessMode !== COLOR_BLINDNESS_MODES.NORMAL) {
        htmlElement.classList.add(colorBlindnessMode);
      }
    }
  }, [fontSize, theme, motion, textSpacing, dyslexicFont, colorBlindnessMode, isLoaded]);
  // Set font size and save to localStorage
  const setFontSize = (newSize) => {
    setFontSizeState(newSize);
  };

  // Set theme and save to localStorage
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };
  
  // Set motion preference
  const setMotion = (newMotion) => {
    setMotionState(newMotion);
  };
  
  // Set text spacing
  const setTextSpacing = (newSpacing) => {
    setTextSpacingState(newSpacing);
  };
    // Set dyslexic font
  const setDyslexicFont = (enabled) => {
    setDyslexicFontState(enabled);
  };
  
  // Set color blindness mode
  const setColorBlindnessMode = (mode) => {
    setColorBlindnessModeState(mode);
  };
  // Provide context value
  const contextValue = {
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
