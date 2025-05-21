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
  calculateOverallProgress 
} from '../../utils/storageUtils';
import { useLessonTimer } from '../../utils/useLessonTimer';

export default function LessonPage({ params }) {
  const [activeTab, setActiveTab] = useState('content');
  const [activeSection, setActiveSection] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [allLessons, setAllLessons] = useState([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  
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
    }
  }, [currentLessonId]);

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
          setShowOutline(!showOutline);
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
  };

  // Navigate to next section
  const nextSection = () => {
    if (activeSection < currentLessonData.sections.length - 1) {
      setActiveSection(activeSection + 1);
      window.scrollTo(0, 0);
    } else {
      setActiveTab('quiz');
    }
  };

  // Navigate to previous section
  const prevSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle lesson completion when navigating to next section from the last section
  const handleLastSectionComplete = () => {
    if (activeSection === currentLessonData.sections.length - 1 && !lessonCompleted) {
      handleMarkComplete();
    }
  };
  
  // Handle quiz completion
  const handleQuizComplete = (quizResults) => {
    // If score is 80% or higher, mark lesson as completed
    if (quizResults.percentage >= 80) {
      handleMarkComplete();
    }
    
    // Announce results to screen reader
    window.announceToScreenReader?.(`Quiz completed with score of ${quizResults.score} out of ${quizResults.totalQuestions}, ${quizResults.percentage}%`);
  };
  
  // Toggle outline visibility
  const toggleOutline = () => {
    setShowOutline(!showOutline);
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

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold">{currentLessonData.title}</h1>
          <LessonCompletionBadge 
            lessonId={currentLessonId}
            onStatusChange={() => setLessonCompleted(!lessonCompleted)}
          />
        </div>
        
        {/* Time spent */}
        <div className="mb-4 text-sm text-gray-600">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Time spent: {totalTimeFormatted}
          </span>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
            <li className="mr-2" role="presentation">
              <button
                id="content-tab"
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'content'
                    ? 'text-blue-600 border-blue-600'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
                type="button"
                role="tab"
                aria-controls="content-tab-panel"
                aria-selected={activeTab === 'content'}
                onClick={() => setActiveTab('content')}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                  Content
                </span>
                <span className="sr-only ml-1">(Alt+1)</span>
              </button>
            </li>
            <li className="mr-2" role="presentation">
              <button
                id="quiz-tab"
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'quiz'
                    ? 'text-blue-600 border-blue-600'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
                type="button"
                role="tab"
                aria-controls="quiz-tab-panel"
                aria-selected={activeTab === 'quiz'}
                onClick={() => setActiveTab('quiz')}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Quiz
                </span>
                <span className="sr-only ml-1">(Alt+2)</span>
              </button>
            </li>
            <li role="presentation">
              <button
                id="resources-tab"
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'resources'
                    ? 'text-blue-600 border-blue-600'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
                type="button"
                role="tab"
                aria-controls="resources-tab-panel"
                aria-selected={activeTab === 'resources'}
                onClick={() => setActiveTab('resources')}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                  Resources
                </span>
                <span className="sr-only ml-1">(Alt+3)</span>
              </button>
            </li>
          </ul>
        </div>
        
        {/* Content Area */}
        <div className="relative">
          {/* Outline Toggle */}
          <button
            onClick={toggleOutline}
            className="absolute right-0 top-0 p-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
            aria-label={showOutline ? "Hide lesson outline" : "Show lesson outline"}
            aria-expanded={showOutline}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <span className="sr-only">Outline (Alt+O)</span>
          </button>
          
          {/* Outline Panel */}
          {showOutline && (
            <div className="mb-6 animate-fadeIn">
              <AccessibleOutline 
                sections={currentLessonData.sections}
                currentSection={activeSection}
                onSelectSection={(index) => setActiveSection(index)}
              />
            </div>
          )}
          
          {/* Main Content Tabs */}
          <div className="mt-6">
            <div
              id="content-tab-panel"
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
                />
              </div>
            </div>
            
            <div
              id="quiz-tab-panel"
              role="tabpanel"
              aria-labelledby="quiz-tab"
              className={activeTab === 'quiz' ? 'block' : 'hidden'}
            >
              <Quiz
                lessonId={currentLessonId}
                questions={currentLessonData.quiz?.questions || []}
                onComplete={handleQuizComplete}
              />
            </div>
            
            <div
              id="resources-tab-panel"
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
