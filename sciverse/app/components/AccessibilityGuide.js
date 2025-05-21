"use client";

import { useState } from 'react';
import { useTheme } from './ThemeProvider';

export default function AccessibilityGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    setFontSize, 
    setTheme, 
    setMotion, 
    setTextSpacing, 
    setDyslexicFont,
    setColorBlindnessMode 
  } = useTheme();

  const shortcuts = [
    { key: 'Alt + 1', description: 'Switch to first content tab' },
    { key: 'Alt + 2', description: 'Switch to second content tab' },
    { key: 'Alt + 3', description: 'Switch to third content tab' },
    { key: 'Alt + O', description: 'Toggle lesson outline' },
    { key: '?', description: 'Show keyboard shortcuts' },
    { key: 'Tab / Shift + Tab', description: 'Navigate through interactive elements' },
    { key: 'Arrow Keys', description: 'Navigate through lesson content' },
    { key: 'Ctrl + Alt + 1', description: 'Decrease font size' },
    { key: 'Ctrl + Alt + 2', description: 'Increase font size' },
    { key: 'Ctrl + Alt + S', description: 'Skip to main content' },
  ];

  return (
    <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-medium text-lg mb-2"
        aria-expanded={isOpen}
        aria-controls="accessibility-guide-content"
      >
        <span>Accessibility Guide</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div id="accessibility-guide-content" className="mt-2">
          <p className="mb-4">
            SciVerse is designed to be accessible to all users. Below you'll find information about
            our accessibility features and how to use them.
          </p>
          
          <h3 className="font-semibold text-lg mb-2">Keyboard Shortcuts</h3>
          <div className="mb-4 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <caption className="sr-only">Keyboard shortcuts and their descriptions</caption>
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border text-left" scope="col">Shortcut</th>
                  <th className="py-2 px-4 border text-left" scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {shortcuts.map((shortcut, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-4 border font-mono">{shortcut.key}</td>
                    <td className="py-2 px-4 border">{shortcut.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <h3 className="font-semibold text-lg mb-2">Visual Accessibility</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>
              <strong>Theme Options:</strong> Choose between light, dark, and high contrast themes using the accessibility panel.
            </li>
            <li>
              <strong>Font Size:</strong> Adjust text size for better readability.
            </li>
            <li>              <strong>Text Spacing:</strong> Increase letter and word spacing for easier reading.
            </li>
            <li>
              <strong>Dyslexic Font:</strong> Enable Lexend Deca font, a dyslexia-friendly typeface.
            </li>
            <li>
              <strong>Color Blindness Modes:</strong> Simulate different types of color blindness to test content accessibility.
            </li>
          </ul>
          
          <h3 className="font-semibold text-lg mb-2">Motion & Animation</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>
              <strong>Motion Preferences:</strong> Choose between full animations, reduced motion, or no motion.
            </li>
            <li>
              <strong>System Settings:</strong> SciVerse also respects your system's reduced motion setting.
            </li>
          </ul>
          
          <h3 className="font-semibold text-lg mb-2">Screen Reader Support</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>
              <strong>ARIA Attributes:</strong> All interactive elements have proper ARIA roles and states.
            </li>
            <li>
              <strong>Semantic HTML:</strong> Content follows proper HTML structure for better navigation.
            </li>
            <li>
              <strong>Live Regions:</strong> Dynamic content changes are announced to screen readers.
            </li>
          </ul>
          
          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={() => window.open('/accessibility', '_blank')}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              View Full Accessibility Documentation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
