"use client";

import { useState } from 'react';
import { useTheme } from '../components/ThemeProvider';
import AccessibilityGuide from '../components/AccessibilityGuide';

export default function AccessibilityDemoPage() {
  const { 
    fontSize, 
    theme, 
    motion, 
    textSpacing, 
    dyslexicFont, 
    colorBlindnessMode 
  } = useTheme();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample animation for motion demo
  const animationDemo = motion === 'full' ? 'animate-bounce' : '';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Accessibility Features Demo</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Current Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-100 rounded-md">
                <span className="font-medium">Font Size:</span> {fontSize}
              </div>
              <div className="p-3 bg-gray-100 rounded-md">
                <span className="font-medium">Theme:</span> {theme}
              </div>
              <div className="p-3 bg-gray-100 rounded-md">
                <span className="font-medium">Motion:</span> {motion}
              </div>
              <div className="p-3 bg-gray-100 rounded-md">
                <span className="font-medium">Text Spacing:</span> {textSpacing}
              </div>
              <div className="p-3 bg-gray-100 rounded-md">
                <span className="font-medium">Dyslexic Font:</span> {dyslexicFont ? 'Enabled' : 'Disabled'}
              </div>
              <div className="p-3 bg-gray-100 rounded-md">
                <span className="font-medium">Color Blindness:</span> {colorBlindnessMode}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-selected={activeTab === 'overview'}
                aria-controls="tab-panel-overview"
                id="tab-overview"
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('visual')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'visual'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-selected={activeTab === 'visual'}
                aria-controls="tab-panel-visual"
                id="tab-visual"
              >
                Visual Demo
              </button>
              <button
                onClick={() => setActiveTab('motion')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'motion'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-selected={activeTab === 'motion'}
                aria-controls="tab-panel-motion"
                id="tab-motion"
              >
                Motion Demo
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {/* Overview Tab */}
            <div
              id="tab-panel-overview"
              role="tabpanel"
              aria-labelledby="tab-overview"
              className={activeTab === 'overview' ? 'block' : 'hidden'}
            >
              <h3 className="text-xl font-semibold mb-3">Welcome to the Accessibility Demo</h3>
              <p className="mb-4">
                This page demonstrates the various accessibility features implemented in SciVerse. 
                Use the tabs above to explore different aspects of the accessibility implementation.
              </p>
              <p className="mb-4">
                You can adjust your accessibility settings using the panel in the bottom right corner of the screen,
                or via the comprehensive Accessibility Settings page.
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium mb-2">Implemented Accessibility Features:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Multiple theme options (light, dark, high-contrast)</li>
                  <li>Font size controls</li>
                  <li>Motion reduction options</li>
                  <li>Text spacing adjustments</li>
                  <li>Lexend Deca font support</li>
                  <li>Color blindness simulation modes</li>
                  <li>Screen reader support with ARIA attributes</li>
                  <li>Keyboard navigation</li>
                  <li>Skip-to-content link</li>
                </ul>
              </div>
            </div>
            
            {/* Visual Demo Tab */}
            <div
              id="tab-panel-visual"
              role="tabpanel"
              aria-labelledby="tab-visual"
              className={activeTab === 'visual' ? 'block' : 'hidden'}
            >
              <h3 className="text-xl font-semibold mb-3">Visual Accessibility Demo</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium mb-2">Text Spacing Demo</h4>
                  <p>
                    This paragraph demonstrates the current text spacing setting.
                    You can adjust text spacing in the accessibility panel.
                    Increased spacing can help with readability for some users.
                  </p>
                </div>
                
                <div className="p-4 border rounded-md">                  <h4 className="font-medium mb-2">Font Demo</h4>
                  <p>
                    This text demonstrates the current font setting.
                    If you've enabled the dyslexia-friendly font, you'll see
                    the difference in this paragraph.
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Color Contrast Demo</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-500 text-white rounded-md">
                    Text on blue background
                  </div>
                  <div className="p-4 bg-green-500 text-white rounded-md">
                    Text on green background
                  </div>
                  <div className="p-4 bg-red-500 text-white rounded-md">
                    Text on red background
                  </div>
                </div>
                <p className="text-sm mt-2">
                  The color blindness mode affects how these colors appear.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Theme Impact Demo</h4>
                <div className="p-4 bg-card border border-gray-200 rounded-md">
                  <p>This box uses theme-aware colors and will adapt to your selected theme.</p>
                  <div className="mt-3">
                    <button className="px-4 py-2 bg-primary text-white rounded-md">
                      Themed Button
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Motion Demo Tab */}
            <div
              id="tab-panel-motion"
              role="tabpanel"
              aria-labelledby="tab-motion"
              className={activeTab === 'motion' ? 'block' : 'hidden'}
            >
              <h3 className="text-xl font-semibold mb-3">Motion & Animation Demo</h3>
              <p className="mb-4">
                This tab demonstrates how animations are affected by motion preference settings.
                The current motion setting is: <strong>{motion}</strong>
              </p>
              
              <div className="flex flex-wrap gap-6 items-center justify-center p-6 border rounded-md mb-6">
                <div className={`p-4 bg-blue-500 text-white rounded-full ${animationDemo}`}>
                  Bouncing Element
                </div>
                
                <div className="text-center">
                  <div className="mb-2">Hover Effect:</div>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-md transition-transform hover:scale-110">
                    Hover Over Me
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-md">
                <h4 className="font-medium mb-2">How It Works:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Full Motion:</strong> All animations and transitions are enabled
                  </li>
                  <li>
                    <strong>Reduced Motion:</strong> Subtle and essential animations only
                  </li>
                  <li>
                    <strong>No Motion:</strong> All animations and transitions are disabled
                  </li>
                </ul>
                <p className="mt-2 text-sm">
                  SciVerse also respects your system's prefers-reduced-motion setting.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <AccessibilityGuide />
      </div>
    </div>
  );
}
