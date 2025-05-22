'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * XPRing - Animated circular progress to display total XP and current level
 * @param {number} xp - Current XP amount
 * @param {number} level - Current level
 * @param {string} size - Size of the ring (sm, md, lg)
 * @param {boolean} showAnimation - Whether to show animation effects
 * @param {number} previousXP - Previous XP amount (for animation)
 */
export function XPRing({ 
  xp = 0, 
  level = 1, 
  size = "md", 
  showAnimation = false,
  previousXP = null
}) {
  const prevXpRef = useRef(previousXP !== null ? previousXP : xp);
  const [animatedXP, setAnimatedXP] = useState(previousXP !== null ? previousXP : xp);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  
  // Size configuration
  const sizeMap = {
    sm: 120,
    md: 160,
    lg: 200,
  };
  
  const ringSize = sizeMap[size] || sizeMap.md;
  const stroke = ringSize * 0.06; // Scale stroke width with size
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // XP thresholds matching the backend
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
    21000,  // Level 20
    25000,  // Level 21
    30000,  // Level 22
    36000,  // Level 23
    43000,  // Level 24
    50000   // Level 25
  ];

  // Handle XP animation when value changes
  useEffect(() => {
    // Check if animation should run
    if (xp !== prevXpRef.current) {
      setIsAnimating(true);
      
      // Start from previous XP
      setAnimatedXP(prevXpRef.current);
      
      // Show pulse effect for XP gain
      if (xp > prevXpRef.current && showAnimation) {
        setShowPulse(true);
        setTimeout(() => setShowPulse(false), 2000);
      }
      
      // Animate to new XP
      const startTime = performance.now();
      const duration = 1500; // 1.5 seconds
      const diffXP = xp - prevXpRef.current;
      
      const animateXP = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smoother animation
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOut(progress);
        
        setAnimatedXP(Math.floor(prevXpRef.current + diffXP * easedProgress));
        
        if (progress < 1) {
          requestAnimationFrame(animateXP);
        } else {
          setIsAnimating(false);
          prevXpRef.current = xp;
        }
      };
      
      requestAnimationFrame(animateXP);
    } else {
      // If XP didn't change, just set the value directly
      setAnimatedXP(xp);
      prevXpRef.current = xp;
    }
  }, [xp, showAnimation]);

  // Calculate current and next level based on XP
  const getCurrentLevel = (xpAmount) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xpAmount >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  };
  
  const calculatedLevel = getCurrentLevel(animatedXP);
  const displayLevel = Math.max(calculatedLevel, level); // Use higher of calculated or provided level
  
  // Calculate progress for circle
  const currentLevelIndex = Math.min(Math.max(displayLevel - 1, 0), LEVEL_THRESHOLDS.length - 1);
  const currentLevelXP = LEVEL_THRESHOLDS[currentLevelIndex] || 0;
  
  const nextLevelIndex = Math.min(displayLevel, LEVEL_THRESHOLDS.length - 1);
  const nextLevelXP = LEVEL_THRESHOLDS[nextLevelIndex] || (currentLevelXP + 1000);
  
  const xpForNextLevel = nextLevelXP - currentLevelXP;
  const xpProgress = animatedXP - currentLevelXP;
  const progress = Math.min(Math.max(xpProgress / xpForNextLevel, 0), 1);
  const offset = circumference * (1 - progress);

  // Define colors based on level
  const getColorsByLevel = (level) => {
    switch(true) {
      case level >= 20:
        return { 
          ring: 'url(#gradient-legendary)', 
          text: 'text-amber-500',
          badge: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300',
          title: 'Legendary'
        };
      case level >= 15:
        return { 
          ring: 'url(#gradient-gold)', 
          text: 'text-amber-500',
          badge: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300',
          title: 'Expert'
        };
      case level >= 10:
        return { 
          ring: 'url(#gradient-purple)', 
          text: 'text-purple-600',
          badge: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300',
          title: 'Advanced'
        };
      case level >= 5:
        return { 
          ring: 'url(#gradient-blue)', 
          text: 'text-blue-600',
          badge: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
          title: 'Intermediate'
        };
      default:
        return { 
          ring: 'url(#gradient-green)', 
          text: 'text-green-600',
          badge: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300',
          title: 'Beginner'
        };
    }
  };

  const colors = getColorsByLevel(displayLevel);
  
  // Calculate font sizes based on component size
  const fontSizes = {
    sm: {
      xp: 'text-xl',
      level: 'text-base',
      nextLevel: 'text-xs'
    },
    md: {
      xp: 'text-2xl',
      level: 'text-lg',
      nextLevel: 'text-xs'
    },
    lg: {
      xp: 'text-3xl',
      level: 'text-xl',
      nextLevel: 'text-sm'
    }
  };
  
  const fonts = fontSizes[size] || fontSizes.md;

  return (
    <div className="relative flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      {/* Level rank badge */}
      {size !== 'sm' && (
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
          {colors.title}
        </div>
      )}
      
      <svg width={ringSize} height={ringSize} className="transform -rotate-90">
        {/* Define gradients */}
        <defs>
          <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="gradient-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="gradient-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="gradient-legendary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffcb6b" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          
          {/* Glow filter for animation */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="transparent"
          className="dark:opacity-30"
        />
        
        {/* Progress circle */}
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          stroke={colors.ring}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-700 ${isAnimating ? 'ease-out' : ''}`}
          filter={showAnimation && isAnimating ? "url(#glow)" : ""}
        />
        
        {/* Level tick marks - show for medium and large rings */}
        {(size === 'md' || size === 'lg') && progress > 0.25 && (
          <line 
            x1={ringSize / 2} 
            y1={ringSize / 2} 
            x2={ringSize / 2} 
            y2={stroke * 1.5} 
            stroke={colors.ring} 
            strokeWidth={stroke / 3} 
            strokeLinecap="round"
            transform={`rotate(90, ${ringSize / 2}, ${ringSize / 2})`}
            opacity="0.7"
          />
        )}
        
        {(size === 'md' || size === 'lg') && progress > 0.5 && (
          <line 
            x1={ringSize / 2} 
            y1={ringSize / 2} 
            x2={ringSize / 2} 
            y2={stroke * 1.5} 
            stroke={colors.ring} 
            strokeWidth={stroke / 3} 
            strokeLinecap="round"
            transform={`rotate(180, ${ringSize / 2}, ${ringSize / 2})`}
            opacity="0.7"
          />
        )}
        
        {(size === 'md' || size === 'lg') && progress > 0.75 && (
          <line 
            x1={ringSize / 2} 
            y1={ringSize / 2} 
            x2={ringSize / 2} 
            y2={stroke * 1.5} 
            stroke={colors.ring} 
            strokeWidth={stroke / 3} 
            strokeLinecap="round"
            transform={`rotate(270, ${ringSize / 2}, ${ringSize / 2})`}
            opacity="0.7"
          />
        )}
      </svg>
      
      <div className="absolute inset-0 flex flex-col justify-center items-center">
        <div className={`${fonts.xp} font-bold ${colors.text}`}>
          {animatedXP.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
            <path d="M10 2l2.5 5 5.5.75-4 3.85.95 5.4-4.95-2.6L5.05 17l.95-5.4-4-3.85L7.5 7z" />
          </svg>
          <span className={`${fonts.level} font-semibold ${colors.text}`}>Level {displayLevel}</span>
        </div>
        
        <div className={`${fonts.nextLevel} text-gray-500 dark:text-gray-400 mt-1 text-center`}>
          {nextLevelXP - animatedXP} XP to next level
        </div>
      </div>
      
      {/* Pulse animation for XP gain */}
      {showPulse && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-ping absolute h-full w-full rounded-full bg-blue-400 opacity-20"></div>
        </div>
      )}
      
      {/* Spinning animation for level up */}
      {showAnimation && isAnimating && xp > previousXP && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute h-full w-full rounded-full border-4 border-transparent border-t-blue-500 animate-spin opacity-30"></div>
        </div>
      )}
    </div>
  );
}

// Default export for backward compatibility
export default XPRing;
