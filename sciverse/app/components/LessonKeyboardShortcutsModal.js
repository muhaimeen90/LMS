"use client";

/**
 * Displays keyboard shortcuts specific to lesson navigation
 */
export default function LessonKeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 id="keyboard-shortcuts-title" className="text-2xl font-semibold">Keyboard Shortcuts</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
              aria-label="Close keyboard shortcuts"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-blue-700">
              These keyboard shortcuts are designed to help you navigate through the lesson content more efficiently.
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Lesson Navigation</h3>
            <div className="space-y-2">
              <div className="flex items-center py-2 border-b border-gray-100">
                <div className="w-1/2">
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mr-2 text-sm">←</kbd>
                  <span>Previous section</span>
                </div>
                <div className="w-1/2 text-gray-600">
                  Navigate to the previous section of the lesson
                </div>
              </div>
              
              <div className="flex items-center py-2 border-b border-gray-100">
                <div className="w-1/2">
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mr-2 text-sm">→</kbd>
                  <span>Next section</span>
                </div>
                <div className="w-1/2 text-gray-600">
                  Navigate to the next section of the lesson
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Tab Switching</h3>
            <div className="space-y-2">
              <div className="flex items-center py-2 border-b border-gray-100">
                <div className="w-1/2">
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mr-2 text-sm">Alt</kbd> + 
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mx-2 text-sm">1</kbd>
                  <span>Lesson Content</span>
                </div>
                <div className="w-1/2 text-gray-600">
                  Switch to the Lesson Content tab
                </div>
              </div>
              
              <div className="flex items-center py-2 border-b border-gray-100">
                <div className="w-1/2">
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mr-2 text-sm">Alt</kbd> + 
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mx-2 text-sm">2</kbd>
                  <span>Knowledge Check</span>
                </div>
                <div className="w-1/2 text-gray-600">
                  Switch to the Knowledge Check tab
                </div>
              </div>
              
              <div className="flex items-center py-2 border-b border-gray-100">
                <div className="w-1/2">
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mr-2 text-sm">Alt</kbd> + 
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mx-2 text-sm">3</kbd>
                  <span>Interactive Elements</span>
                </div>
                <div className="w-1/2 text-gray-600">
                  Switch to the Interactive Elements tab
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Global Shortcuts</h3>
            <div className="space-y-2">
              <div className="flex items-center py-2 border-b border-gray-100">
                <div className="w-1/2">
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mr-2 text-sm">Ctrl</kbd> + 
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mx-2 text-sm">Alt</kbd> + 
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mx-2 text-sm">S</kbd>
                  <span>Skip to content</span>
                </div>
                <div className="w-1/2 text-gray-600">
                  Skip to the main content area
                </div>
              </div>
              
              <div className="flex items-center py-2 border-b border-gray-100">
                <div className="w-1/2">
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mr-2 text-sm">Ctrl</kbd> + 
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mx-2 text-sm">Alt</kbd> + 
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mx-2 text-sm">1</kbd>
                  <span>Increase font size</span>
                </div>
                <div className="w-1/2 text-gray-600">
                  Make the text larger
                </div>
              </div>
              
              <div className="flex items-center py-2 border-b border-gray-100">
                <div className="w-1/2">
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mr-2 text-sm">Ctrl</kbd> + 
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mx-2 text-sm">Alt</kbd> + 
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mx-2 text-sm">2</kbd>
                  <span>Decrease font size</span>
                </div>
                <div className="w-1/2 text-gray-600">
                  Make the text smaller
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
