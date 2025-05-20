"use client";

// Theme options
export const FONT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  HIGH_CONTRAST: 'high-contrast'
};

// Utility function to load settings from localStorage
export const loadSettings = () => {
  if (typeof window === 'undefined') {
    return {
      fontSize: FONT_SIZES.MEDIUM,
      theme: THEMES.LIGHT
    };
  }

  try {
    const savedSettings = localStorage.getItem('sciverse-settings');
    return savedSettings ? JSON.parse(savedSettings) : {
      fontSize: FONT_SIZES.MEDIUM,
      theme: THEMES.LIGHT
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      fontSize: FONT_SIZES.MEDIUM,
      theme: THEMES.LIGHT
    };
  }
};

// Utility function to save settings to localStorage
export const saveSettings = (settings) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('sciverse-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

// Get CSS classes for current font size
export const getFontSizeClasses = (fontSize) => {
  switch (fontSize) {
    case FONT_SIZES.SMALL:
      return 'text-sm';
    case FONT_SIZES.LARGE:
      return 'text-xl';
    case FONT_SIZES.MEDIUM:
    default:
      return 'text-base';
  }
};

// Get CSS classes for current theme
export const getThemeClasses = (theme) => {
  switch (theme) {
    case THEMES.DARK:
      return 'dark bg-gray-900 text-white';
    case THEMES.HIGH_CONTRAST:
      return 'high-contrast bg-black text-white';
    case THEMES.LIGHT:
    default:
      return 'light bg-white text-gray-900';
  }
};

// Utility function to store progress in localStorage
export const saveProgress = (lessonId, progress) => {
  if (typeof window === 'undefined') return;
  
  try {
    const savedProgress = localStorage.getItem('sciverse-progress') || '{}';
    const allProgress = JSON.parse(savedProgress);
    
    allProgress[lessonId] = progress;
    localStorage.setItem('sciverse-progress', JSON.stringify(allProgress));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

// Utility function to load progress from localStorage
export const loadProgress = (lessonId) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const savedProgress = localStorage.getItem('sciverse-progress') || '{}';
    const allProgress = JSON.parse(savedProgress);
    
    return allProgress[lessonId] || null;
  } catch (error) {
    console.error('Error loading progress:', error);
    return null;
  }
};
