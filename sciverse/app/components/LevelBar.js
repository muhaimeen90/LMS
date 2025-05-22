'use client';

import ProgressBar from './ProgressBar';

/**
 * LevelBar - Displays progress towards next level
 */
export default function LevelBar({ xp, level }) {
  // XP thresholds per level
  const thresholds = [0, 100, 300, 600, 1000, 1500];
  const currentLevelXP = thresholds[level - 1] || 0;
  const nextLevelXP = thresholds[level] || currentLevelXP + 100;
  const progress = Math.min(
    Math.max((xp - currentLevelXP) / (nextLevelXP - currentLevelXP) * 100, 0),
    100
  );

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
        Level {level} Progress
      </h3>
      <ProgressBar
        value={progress}
        max={100}
        label={`Level ${level}`}
        size="md"
        color="success"
      />
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {xp - currentLevelXP} / {nextLevelXP - currentLevelXP} XP
      </p>
    </div>
  );
}
