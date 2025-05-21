'use client';

import { useEffect, useState } from 'react';

/**
 * Progress Bar component with WCAG compliance
 * 
 * @param {Object} props
 * @param {number} props.value - Current progress value
 * @param {number} props.max - Maximum progress value
 * @param {string} props.label - Accessible label for the progress bar
 * @param {string} props.size - Size of the progress bar (sm, md, lg)
 * @param {string} props.color - Color theme for the progress bar
 */
const ProgressBar = ({ 
  value, 
  max = 100, 
  label = 'Progress', 
  size = 'md',
  color = 'primary'
}) => {
  const [percentage, setPercentage] = useState(0);
  
  useEffect(() => {
    // Calculate percentage and ensure it's between 0-100
    const calculated = Math.min(Math.max((value / max) * 100, 0), 100);
    setPercentage(calculated);
  }, [value, max]);
  
  // Determine height based on size
  const heightClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  };
  
  // Determine color based on theme
  const colorClasses = {
    primary: 'bg-blue-600',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    purple: 'bg-purple-600'
  };
  
  const height = heightClasses[size] || heightClasses.md;
  const bgColor = colorClasses[color] || colorClasses.primary;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {Math.round(percentage)}%
        </span>
      </div>
      <div 
        className={`w-full ${height} bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden`}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`${label}: ${Math.round(percentage)}%`}
      >
        <div 
          className={`${height} ${bgColor} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
