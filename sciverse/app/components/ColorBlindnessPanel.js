"use client";

import { useState } from 'react';
import { useTheme } from './ThemeProvider';

export default function ColorBlindnessPanel() {
  const { colorBlindnessMode, setColorBlindnessMode } = useTheme();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const modes = [
    { id: 'normal', name: 'Normal' },
    { id: 'protanopia', name: 'Protanopia (Red-Blind)' },
    { id: 'deuteranopia', name: 'Deuteranopia (Green-Blind)' },
    { id: 'tritanopia', name: 'Tritanopia (Blue-Blind)' },
    { id: 'achromatopsia', name: 'Achromatopsia (Monochromacy)' },
  ];

  return (
    <div className="colorblindness-controls fixed bottom-16 right-20 z-40">
      <button
        onClick={togglePanel}
        className="bg-secondary text-white p-3 rounded-full shadow-lg hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
        aria-expanded={isPanelOpen}
        aria-controls="colorblindness-panel"
        aria-label="Toggle color blindness mode panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <span className="sr-only">Color Blindness Modes</span>
      </button>

      {isPanelOpen && (
        <div
          id="colorblindness-panel"
          className="bg-card absolute bottom-16 right-0 p-4 rounded-lg shadow-lg w-72 border border-gray-200"
          role="region"
          aria-label="Color blindness options"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Color Vision</h3>
            <button 
              onClick={togglePanel}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 p-1 rounded-md"
              aria-label="Close color blindness panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Color Blindness Simulation</h4>
            <div className="grid grid-cols-1 gap-2">
              {modes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setColorBlindnessMode(mode.id)}
                  className={`px-4 py-2 rounded-md border text-left ${
                    colorBlindnessMode === mode.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-800 border-gray-300'
                  }`}
                  aria-pressed={colorBlindnessMode === mode.id}
                  aria-label={`${mode.name} color vision mode`}
                >
                  {mode.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              These settings simulate different types of color vision deficiencies to help you understand how users with color blindness may see your content.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
