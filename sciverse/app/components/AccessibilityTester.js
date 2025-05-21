"use client";

import { useState } from 'react';
import { runAccessibilityCheck, analyzeSemanticMarkup } from '../utils/accessibilityChecker';

/**
 * Component for testing and displaying accessibility status of lesson content
 */
export default function AccessibilityTester({ htmlContent, title = "Accessibility Test" }) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const runTest = () => {
    setIsRunning(true);
    
    // Simulate a brief processing time
    setTimeout(() => {
      const accessibilityCheck = runAccessibilityCheck(htmlContent);
      const semanticAnalysis = analyzeSemanticMarkup(htmlContent);
      
      setResults({
        accessibility: accessibilityCheck,
        semantics: semanticAnalysis,
        timestamp: new Date().toLocaleString()
      });
      
      setIsRunning(false);
      setIsExpanded(true);
      
      // Announce results to screen readers
      const passedMsg = accessibilityCheck.passed ? 
        "Accessibility check passed!" : 
        `Accessibility check found ${accessibilityCheck.issues.length} issues.`;
      
      window.announceToScreenReader?.(passedMsg, 'polite');
    }, 500);
  };
  
  return (
    <div className="border border-gray-200 rounded-md mb-4 bg-white">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold">{title}</h3>
        
        <div>
          <button
            onClick={runTest}
            disabled={isRunning}
            className={`px-4 py-1 rounded-md mr-2 ${
              isRunning ? 
                'bg-gray-300 text-gray-600 cursor-not-allowed' : 
                'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            }`}
            aria-busy={isRunning}
          >
            {isRunning ? 'Running Test...' : 'Run Test'}
          </button>
          
          {results && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
              aria-expanded={isExpanded}
              aria-controls="test-results"
            >
              {isExpanded ? 'Hide Results' : 'Show Results'}
            </button>
          )}
        </div>
      </div>
      
      {results && isExpanded && (
        <div id="test-results" className="p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Accessibility Check</h4>
              <span 
                className={`px-2 py-1 rounded-full text-white text-xs font-bold ${
                  results.accessibility.passed ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {results.accessibility.passed ? 'PASSED' : 'ISSUES FOUND'}
              </span>
            </div>
            
            {!results.accessibility.passed && (
              <>
                <h5 className="font-medium text-sm mt-3 mb-1">Issues:</h5>
                <ul className="list-disc list-inside text-sm text-red-600 mb-3">
                  {results.accessibility.issues.map((issue, index) => (
                    <li key={`issue-${index}`} className="mb-1">{issue}</li>
                  ))}
                </ul>
                
                <h5 className="font-medium text-sm mt-3 mb-1">Recommendations:</h5>
                <ul className="list-disc list-inside text-sm text-blue-600">
                  {results.accessibility.recommendations.map((rec, index) => (
                    <li key={`rec-${index}`} className="mb-1">{rec}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Semantic HTML Analysis</h4>
              <span 
                className={`px-2 py-1 rounded-full text-white text-xs font-bold ${
                  results.semantics.semanticScore >= 80 ? 'bg-green-500' : 
                  results.semantics.semanticScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              >
                {results.semantics.semanticLevel}
              </span>
            </div>
            
            <div className="my-2">
              <div className="flex justify-between mb-1 text-sm">
                <span>Semantic Score:</span>
                <span className="font-medium">{results.semantics.semanticScore}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    results.semantics.semanticScore >= 80 ? 'bg-green-500' : 
                    results.semantics.semanticScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${results.semantics.semanticScore}%` }}
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={results.semantics.semanticScore}
                ></div>
              </div>
            </div>
            
            <h5 className="font-medium text-sm mt-3 mb-1">Analysis:</h5>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {results.semantics.issues.map((issue, index) => (
                <li key={`semantic-${index}`} className="mb-1">{issue}</li>
              ))}
            </ul>
          </div>
          
          <div className="text-xs text-gray-500 mt-4 text-right">
            Test run at: {results.timestamp}
          </div>
        </div>
      )}
    </div>
  );
}
