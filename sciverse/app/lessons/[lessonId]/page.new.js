"use client";

import { useState, useEffect } from 'react';
import { lessonData } from '../../data/lessonData';
import Link from 'next/link';
import LessonCompletionBadge from '../../components/LessonCompletionBadge';
import Quiz from '../../components/Quiz';
import ProgressBar from '../../components/ProgressBar';
import AdaptiveLearningPath from '../../components/AdaptiveLearningPath';
import LessonNavigationAssistant from '../../components/LessonNavigationAssistant';
import LessonKeyboardShortcutsModal from '../../components/LessonKeyboardShortcutsModal';
import AccessibleOutline from '../../components/AccessibleOutline';
import { 
  markLessonCompleted, 
  isLessonCompleted,
  calculateOverallProgress,
  saveQuizResults,
  getQuizScore 
} from '../../utils/storageUtils';
import { useLessonTimer } from '../../utils/useLessonTimer';
import { announceToScreenReader } from '../../utils/screenReaderAnnouncer';

export default function LessonPage({ params }) {
  const [activeTab, setActiveTab] = useState('content');
  const [activeSection, setActiveSection] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [allLessons, setAllLessons] = useState([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  
  // Get the current lesson data
  const currentLessonId = params.lessonId;
  const currentLessonData = lessonData.find(lesson => lesson.id === currentLessonId) || lessonData[0];
  
  // Use our lesson timer hook
  const { 
    totalTimeSpent,
    totalTimeFormatted,
    pauseTimer
  } = useLessonTimer(currentLessonId);

  // Initialize state on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if lesson is completed
      const completed = isLessonCompleted(currentLessonId);
      setLessonCompleted(completed);
      
      // Set all lessons data
      const allLessonsData = lessonData || [];
      setAllLessons(allLessonsData);
      
      // Load quiz results if available
      const existingQuizResults = getQuizScore(currentLessonId);
      if (existingQuizResults) {
        setQuizResults(existingQuizResults);
      }
      
      // Announce lesson loaded to screen readers
      announceToScreenReader(`Lesson ${currentLessonData.title} loaded. Use question mark key for keyboard shortcuts.`);
    }
  }, [currentLessonId, currentLessonData.title]);

  // Save time spent when user leaves the page
  useEffect(() => {
    // When component unmounts, pause timer to save
    return () => {
      pauseTimer(true);
    };
  }, [pauseTimer]);
  
  // Add keyboard shortcuts for lesson navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't activate shortcuts when user is typing in form fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Question mark key to show keyboard shortcuts
      if (e.key === '?') {
        setShowKeyboardShortcuts(true);
        e.preventDefault();
        return;
      }
      
      // Arrow keys for navigation (with no modifiers)
      if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        if (e.key === 'ArrowRight' && activeTab === 'content') {
          nextSection();
          e.preventDefault();
        } else if (e.key === 'ArrowLeft' && activeTab === 'content') {
          prevSection();
          e.preventDefault();
        }
      }
      
      // Alt + number keys for tabs
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        if (e.key === '1') {
          setActiveTab('content');
          e.preventDefault();
        } else if (e.key === '2') {
          setActiveTab('quiz');
          e.preventDefault();
        } else if (e.key === '3') {
          setActiveTab('resources');
          e.preventDefault();
        } else if (e.key === 'o') {
          toggleOutline();
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSection, activeTab, showOutline]);
  
  // Handle marking lesson as completed
  const handleMarkComplete = () => {
    markLessonCompleted(currentLessonId, true);
    setLessonCompleted(true);
    announceToScreenReader("Lesson marked as completed");
  };

  // Handle lesson completion when navigating to next section from the last section
  const handleLastSectionComplete = () => {
    if (activeSection === currentLessonData.sections.length - 1 && !lessonCompleted) {
      handleMarkComplete();
    }
  };

  // Navigate to next section
  const nextSection = () => {
    if (activeSection < currentLessonData.sections.length - 1) {
      setActiveSection(activeSection + 1);
      window.scrollTo(0, 0);
      announceToScreenReader(`Section ${activeSection + 2}: ${currentLessonData.sections[activeSection + 1].title}`);
    } else {
      setActiveTab('quiz');
      announceToScreenReader("Navigated to quiz section");
    }
  };

  // Navigate to previous section
  const prevSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      window.scrollTo(0, 0);
      announceToScreenReader(`Section ${activeSection}: ${currentLessonData.sections[activeSection - 1].title}`);
    }
  };
  
  // Toggle outline view
  const toggleOutline = () => {
    setShowOutline(!showOutline);
    announceToScreenReader(showOutline ? "Outline closed" : "Outline opened");
  };
  
  // Handle quiz completion
  const handleQuizComplete = (result) => {
    setQuizResults(result);
    
    // Save quiz results
    saveQuizResults(currentLessonId, result.score, result.totalQuestions);
    
    // Auto-mark lesson as complete if score is >= 80%
    if (result.percentage >= 80 && !lessonCompleted) {
      handleMarkComplete();
    }
    
    announceToScreenReader(`Quiz completed with a score of ${result.percentage}%`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-600 hover:text-blue-600 focus:text-blue-600 focus:outline-none focus:underline">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link href="/lessons" className="ml-1 text-gray-600 hover:text-blue-600 focus:text-blue-600 focus:outline-none focus:underline">
                  Lessons
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 font-medium text-gray-800">
                  {currentLessonData.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>        
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{currentLessonData.title}</h1>
        
        {/* Lesson Status */}
        <div className="mb-4 flex items-center justify-between">
          <LessonCompletionBadge 
            lessonId={currentLessonId} 
            onStatusChange={(status) => setLessonCompleted(status)}
          />
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span>Time spent: </span>
            <span className="font-medium">{totalTimeFormatted}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar 
            value={activeSection + 1} 
            max={currentLessonData.sections.length}
            label={`Section ${activeSection + 1} of ${currentLessonData.sections.length}`}
            size="md"
            color="primary"
          />
        </div>
        
        {/* Outline Toggle Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleOutline}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-expanded={showOutline}
            aria-controls="lesson-outline"
          >
            {showOutline ? 'Hide Outline' : 'Show Outline'}
            <span className="ml-1 text-xs text-gray-500">(Alt+O)</span>
          </button>
        </div>
        
        {/* Outline Panel */}
        {showOutline && (
          <div id="lesson-outline" className="mb-6 animate-fadeIn">
            <AccessibleOutline 
              sections={currentLessonData.sections}
              currentSection={activeSection}
              onSelectSection={(index) => {
                setActiveSection(index);
                announceToScreenReader(`Navigated to section ${index + 1}: ${currentLessonData.sections[index].title}`);
              }}
            />
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex -mb-px" aria-label="Lesson tabs">
            <button
              onClick={() => {
                setActiveTab('content');
                announceToScreenReader("Navigated to lesson content tab");
              }}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm focus:outline-none ${
                activeTab === 'content'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={activeTab === 'content'}
              aria-controls="content-panel"
              id="content-tab"
            >
              Lesson Content
              <span className="ml-1 text-xs text-gray-500">(Alt+1)</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('quiz');
                announceToScreenReader("Navigated to quiz tab");
              }}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm focus:outline-none ${
                activeTab === 'quiz'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={activeTab === 'quiz'}
              aria-controls="quiz-panel"
              id="quiz-tab"
            >
              Knowledge Check
              <span className="ml-1 text-xs text-gray-500">(Alt+2)</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('resources');
                announceToScreenReader("Navigated to resources tab");
              }}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm focus:outline-none ${
                activeTab === 'resources'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={activeTab === 'resources'}
              aria-controls="resources-panel"
              id="resources-tab"
            >
              Resources
              <span className="ml-1 text-xs text-gray-500">(Alt+3)</span>
            </button>
          </nav>
        </div>
        
        {/* Lesson Content Tab */}
        <div 
          id="content-panel"
          role="tabpanel"
          aria-labelledby="content-tab"
          className={activeTab === 'content' ? 'block' : 'hidden'}
        >
          {/* Section Navigation */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={prevSection}
              disabled={activeSection === 0}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                activeSection === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              aria-label="Previous section"
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Previous
              </span>
            </button>
            <span className="text-sm text-gray-600">
              Section {activeSection + 1} of {currentLessonData.sections.length}
            </span>
            <button
              onClick={() => {
                nextSection();
                if (activeSection === currentLessonData.sections.length - 1) {
                  handleLastSectionComplete();
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={activeSection === currentLessonData.sections.length - 1 ? "Go to quiz" : "Next section"}
            >
              <span className="flex items-center">
                {activeSection === currentLessonData.sections.length - 1 ? 'Go to Quiz' : 'Next'}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </span>
            </button>
          </div>
          
          {/* Section Title */}
          <h2 className="text-2xl font-bold mb-4">
            {currentLessonData.sections[activeSection].title}
          </h2>
          
          {/* Section Content */}
          <div className="prose max-w-none prose-blue dark:prose-invert">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: currentLessonData.sections[activeSection].content 
              }} 
              aria-live="polite"
            />
          </div>
          
          {/* Navigation Buttons (bottom) */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevSection}
              disabled={activeSection === 0}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeSection === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              aria-label="Previous section"
            >
              Previous
            </button>
            <button
              onClick={() => {
                nextSection();
                if (activeSection === currentLessonData.sections.length - 1) {
                  handleLastSectionComplete();
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={activeSection === currentLessonData.sections.length - 1 ? "Go to quiz" : "Next section"}
            >
              {activeSection === currentLessonData.sections.length - 1 ? 'Go to Quiz' : 'Next'}
            </button>
          </div>
        </div>
        
        {/* Quiz Tab */}
        <div 
          id="quiz-panel"
          role="tabpanel"
          aria-labelledby="quiz-tab"
          className={activeTab === 'quiz' ? 'block' : 'hidden'}
        >
          {currentLessonData.quiz?.questions ? (
            <Quiz 
              lessonId={currentLessonId}
              questions={currentLessonData.quiz.questions}
              onComplete={handleQuizComplete}
            />
          ) : (
            <div className="bg-white rounded-lg p-6 dark:bg-gray-800">
              <h2 className="text-2xl font-semibold mb-6">Quiz</h2>
              <p>No quiz available for this lesson.</p>
            </div>
          )}
        </div>
        
        {/* Resources Tab */}
        <div 
          id="resources-panel"
          role="tabpanel"
          aria-labelledby="resources-tab"
          className={activeTab === 'resources' ? 'block' : 'hidden'}
        >
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">
              Learning Path
            </h2>
            
            <AdaptiveLearningPath 
              currentLessonId={currentLessonId}
              allLessons={allLessons}
              onSelectLesson={(lessonId) => {
                window.location.href = `/lessons/${lessonId}`;
              }}
            />
            
            <h2 className="text-2xl font-bold mb-4 mt-10">
              Additional Resources
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {currentLessonData.resources?.map((resource, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                  <p className="text-gray-600 mb-3">{resource.description}</p>
                  <Link 
                    href={resource.url} 
                    className="text-blue-600 hover:underline inline-flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Explore resource
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Accessibility Components */}
      {activeTab === 'content' && (
        <LessonNavigationAssistant
          htmlContent={currentLessonData.sections[activeSection].content}
          onJumpToSection={(section) => setActiveSection(section)}
          currentSection={activeSection}
          totalSections={currentLessonData.sections.length}
          onPrevSection={prevSection}
          onNextSection={nextSection}
        />
      )}
      
      {showKeyboardShortcuts && (
        <LessonKeyboardShortcutsModal
          onClose={() => setShowKeyboardShortcuts(false)}
        />
      )}
    </div>
  );
}
