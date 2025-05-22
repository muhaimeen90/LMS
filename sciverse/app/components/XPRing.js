'use client';

import { useEffect, useState } from 'react';

/**
 * XPRing - Animated circular progress to display total XP and current level
 */
export default function XPRing({ xp, level }) {
  const size = 120;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const thresholds = [0, 100, 300, 600, 1000, 1500]; // XP thresholds per level

  const currentLevelXP = thresholds[level - 1] || 0;
  const nextLevelXP = thresholds[level] || currentLevelXP + 100;
  const progress = Math.min(Math.max((xp - currentLevelXP) / (nextLevelXP - currentLevelXP), 0), 1);
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#3b82f6"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col justify-center items-center">
        <div className="text-xl font-bold text-gray-800">{xp}</div>
        <div className="text-sm text-gray-500">Level {level}</div>
      </div>
    </div>
  );
}
