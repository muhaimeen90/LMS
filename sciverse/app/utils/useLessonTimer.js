'use client';

import { useState, useEffect, useRef } from 'react';
import { trackLessonTime, getLessonTimeSpent } from './storageUtils';

/**
 * Custom hook for tracking time spent on a lesson
 * 
 * @param {string} lessonId - The lesson identifier
 * @returns {Object} Time tracking functions and data
 */
export const useLessonTimer = (lessonId) => {
  const [isActive, setIsActive] = useState(false);
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const timerRef = useRef(null);
  
  // Load initial time spent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTime = getLessonTimeSpent(lessonId);
      setTotalTimeSpent(savedTime);
    }
  }, [lessonId]);
  
  // Start timer on mount and clear on unmount
  useEffect(() => {
    startTimer();
    
    return () => {
      pauseTimer(true);
    };
  }, []);
  
  // Timer functionality
  const startTimer = () => {
    if (!isActive) {
      setIsActive(true);
      timerRef.current = setInterval(() => {
        setCurrentSessionSeconds(prev => prev + 1);
      }, 1000);
    }
  };
  
  const pauseTimer = (saveData = false) => {
    if (isActive) {
      clearInterval(timerRef.current);
      setIsActive(false);
      
      if (saveData && currentSessionSeconds > 0) {
        // Save current session time
        trackLessonTime(lessonId, currentSessionSeconds);
        setTotalTimeSpent(prev => prev + currentSessionSeconds);
        setCurrentSessionSeconds(0);
      }
    }
  };
  
  const resetTimer = () => {
    pauseTimer();
    setCurrentSessionSeconds(0);
  };
  
  // Format time for display (HH:MM:SS)
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  return {
    isActive,
    currentSessionSeconds,
    totalTimeSpent,
    totalTimeFormatted: formatTime(totalTimeSpent),
    currentSessionFormatted: formatTime(currentSessionSeconds),
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime
  };
};

export default useLessonTimer;
