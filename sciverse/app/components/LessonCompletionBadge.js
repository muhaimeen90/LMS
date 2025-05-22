'use client';

import { useState, useEffect } from 'react';
import { isLessonCompleted, markLessonCompleted } from '../utils/storageUtils';

/**
 * LessonCompletionBadge - Shows if a lesson is completed and allows marking as complete
 * 
 * @param {Object} props
 * @param {string} props.lessonId - The lesson identifier
 * @param {boolean} props.showButton - Whether to show the mark as complete button
 * @param {string} props.size - Size of the badge (sm, md, lg)
 * @param {Function} props.onStatusChange - Callback when status changes
 */
const LessonCompletionBadge = ({ 
  lessonId, 
  showButton = true,
  size = 'md',
  onStatusChange
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Load completion status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = isLessonCompleted(lessonId);
      setIsCompleted(completed);
    }
  }, [lessonId]);
  
  const handleMarkComplete = async () => {
    markLessonCompleted(lessonId, true);
    setIsCompleted(true);
    if (onStatusChange) {
      onStatusChange(true);
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication token not found');
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/progress/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: true }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to mark lesson as complete on server:', errorData.message || response.statusText);
      }
    } catch (error) {
      console.error('Error marking lesson as complete on server:', error);
    }
  };
  
  const handleMarkIncomplete = async () => {
    markLessonCompleted(lessonId, false);
    setIsCompleted(false);
    if (onStatusChange) {
      onStatusChange(false);
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication token not found');
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/progress/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: false }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to mark lesson as incomplete on server:', errorData.message || response.statusText);
      }
    } catch (error) {
      console.error('Error marking lesson as incomplete on server:', error);
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  const badgeSize = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div className="flex items-center gap-2">
      {isCompleted ? (
        <span 
          className={`${badgeSize} bg-green-100 text-green-800 font-medium rounded-full inline-flex items-center dark:bg-green-900 dark:text-green-100`}
          aria-label="Lesson completed"
        >
          <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
          </svg>
          Completed
        </span>
      ) : (
        <span 
          className={`${badgeSize} bg-gray-100 text-gray-800 font-medium rounded-full inline-flex items-center dark:bg-gray-700 dark:text-gray-300`}
          aria-label="Lesson not completed"
        >
          In Progress
        </span>
      )}
      
      {showButton && (
        <button
          type="button"
          onClick={isCompleted ? handleMarkIncomplete : handleMarkComplete}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          aria-label={isCompleted ? "Mark as incomplete" : "Mark as completed"}
        >
          {isCompleted ? "Mark as incomplete" : "Mark as completed"}
        </button>
      )}
    </div>
  );
};

export default LessonCompletionBadge;
