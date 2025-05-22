'use client';

import React from 'react';

/**
 * BadgesGrid - Displays list of user badges with icons and tooltips
 */
export default function BadgesGrid({ badges = [] }) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Badges</h3>
      <div role="list" className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {badges.map(badge => (
          <div
            key={badge.badgeId}
            role="listitem"
            className="flex flex-col items-center"
          >
            <div
              className={`w-10 h-10 text-2xl flex items-center justify-center ${badge.unlocked ? 'text-yellow-500' : 'text-gray-400'} ${badge.unlocked ? '' : 'opacity-50'}`}
              aria-hidden="true"
            >
              🏆
            </div>
            <abbr
              title={
                badge.name +
                (badge.unlocked && badge.dateEarned
                  ? ` - Earned on ${new Date(badge.dateEarned).toLocaleDateString()}`
                  : ' - Locked')
              }
              className="text-xs text-gray-600 dark:text-gray-400 mt-1"
            >
              {badge.name}
            </abbr>
          </div>
        ))}
      </div>
    </div>
  );
}
