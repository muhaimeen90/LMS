'use client';

import { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';

/**
 * LevelBar - Displays progress towards next level with improved visualization
 */
export default function LevelBar({ xp, level, progress: explicitProgress }) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [nextLevelXP, setNextLevelXP] = useState(100);
  const [inProgressXP, setInProgressXP] = useState(0);

  // XP thresholds per level - expanded scale matching the backend
  const LEVEL_THRESHOLDS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    450,    // Level 4
    700,    // Level 5
    1000,   // Level 6
    1400,   // Level 7
    1900,   // Level 8
    2500,   // Level 9
    3200,   // Level 10
    4000,   // Level 11
    5000,   // Level 12
    6200,   // Level 13
    7500,   // Level 14
    9000,   // Level 15
    10500,  // Level 16
    12500,  // Level 17
    15000,  // Level 18
    18000,  // Level 19
    21000   // Level 20
  ];

  // Calculate progress for current level
  useEffect(() => {
    if (typeof explicitProgress === 'number') {
      // If progress is explicitly provided, use it
      setCurrentProgress(explicitProgress);
      return;
    }

    // Otherwise calculate based on XP and level
    const currentLevelIndex = Math.min(Math.max(level - 1, 0), LEVEL_THRESHOLDS.length - 1);
    const currentLevelXP = LEVEL_THRESHOLDS[currentLevelIndex] || 0;
    
    const nextLevelIndex = Math.min(level, LEVEL_THRESHOLDS.length - 1);
    const nextLevelThreshold = LEVEL_THRESHOLDS[nextLevelIndex] || currentLevelXP + 1000;
    
    setNextLevelXP(nextLevelThreshold - currentLevelXP);
    setInProgressXP(xp - currentLevelXP);
    
    const calculatedProgress = Math.min(
      Math.max(((xp - currentLevelXP) / (nextLevelThreshold - currentLevelXP)) * 100, 0),
      100
    );
    
    setCurrentProgress(calculatedProgress);
  }, [xp, level, explicitProgress]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
          Level {level} Progress
        </h3>
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          {Math.floor(currentProgress)}%
        </span>
      </div>
      
      <ProgressBar
        value={currentProgress}
        max={100}
        label={`Level ${level}`}
        size="md"
        color="info"
        animated={true}
      />
      
      <div className="flex justify-between mt-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {inProgressXP} / {nextLevelXP} XP
        </p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {nextLevelXP - inProgressXP} XP to Level {level + 1}
        </p>
      </div>
    </div>
  );
}
