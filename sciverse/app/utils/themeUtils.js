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

export const MOTION_PREFERENCES = {
  FULL: 'full',
  REDUCED: 'reduced',
  NONE: 'none'
};

export const TEXT_SPACING = {
  NORMAL: 'normal',
  WIDE: 'wide',
  WIDER: 'wider'
};

export const COLOR_BLINDNESS_MODES = {
  NORMAL: 'normal',
  PROTANOPIA: 'protanopia',
  DEUTERANOPIA: 'deuteranopia',
  TRITANOPIA: 'tritanopia',
  ACHROMATOPSIA: 'achromatopsia'
};

// Utility function to load settings from localStorage
export const loadSettings = () => {
  if (typeof window === 'undefined') {
    return {
      fontSize: FONT_SIZES.MEDIUM,
      theme: THEMES.LIGHT,
      motion: MOTION_PREFERENCES.FULL,
      textSpacing: TEXT_SPACING.NORMAL,
      dyslexicFont: false,
      colorBlindnessMode: COLOR_BLINDNESS_MODES.NORMAL
    };
  }

  try {
    const savedSettings = localStorage.getItem('sciverse-settings');
    return savedSettings ? JSON.parse(savedSettings) : {
      fontSize: FONT_SIZES.MEDIUM,
      theme: THEMES.LIGHT,
      motion: MOTION_PREFERENCES.FULL,
      textSpacing: TEXT_SPACING.NORMAL,
      dyslexicFont: false,
      colorBlindnessMode: COLOR_BLINDNESS_MODES.NORMAL
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      fontSize: FONT_SIZES.MEDIUM,
      theme: THEMES.LIGHT,
      motion: MOTION_PREFERENCES.FULL,
      textSpacing: TEXT_SPACING.NORMAL,
      dyslexicFont: false,
      colorBlindnessMode: COLOR_BLINDNESS_MODES.NORMAL
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

// Get CSS classes for motion preferences
export const getMotionClasses = (motion) => {
  switch (motion) {
    case MOTION_PREFERENCES.REDUCED:
      return 'reduced-motion';
    case MOTION_PREFERENCES.NONE:
      return 'no-motion';
    case MOTION_PREFERENCES.FULL:
    default:
      return '';
  }
};

// Get CSS classes for text spacing
export const getTextSpacingClasses = (spacing) => {
  switch (spacing) {
    case TEXT_SPACING.WIDE:
      return 'text-spacing-wide';
    case TEXT_SPACING.WIDER:
      return 'text-spacing-wider';
    case TEXT_SPACING.NORMAL:
    default:
      return '';
  }
};

// Get CSS classes for dyslexic font
export const getDyslexicFontClasses = (enabled) => {
  return enabled ? 'dyslexic-font' : '';
};

// Get CSS classes for color blindness mode
export const getColorBlindnessClasses = (mode) => {
  switch (mode) {
    case COLOR_BLINDNESS_MODES.PROTANOPIA:
      return 'protanopia';
    case COLOR_BLINDNESS_MODES.DEUTERANOPIA:
      return 'deuteranopia';
    case COLOR_BLINDNESS_MODES.TRITANOPIA:
      return 'tritanopia';
    case COLOR_BLINDNESS_MODES.ACHROMATOPSIA:
      return 'achromatopsia';
    case COLOR_BLINDNESS_MODES.NORMAL:
    default:
      return '';
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
