"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../utils/AuthContext';
import LessonCompletionBadge from '../../components/LessonCompletionBadge';
import ProgressBar from '../../components/ProgressBar';
import AdaptiveLearningPath from '../../components/AdaptiveLearningPath';
import LessonNavigationAssistant from '../../components/LessonNavigationAssistant';
import LessonKeyboardShortcutsModal from '../../components/LessonKeyboardShortcutsModal';
import AccessibleOutline from '../../components/AccessibleOutline';
import ChatBot from '../../components/ChatBot';
import { 
  markLessonCompleted, 
  isLessonCompleted,
  saveQuizResults,
  getQuizScore 
} from '../../utils/storageUtils';
import { useLessonTimer } from '../../utils/useLessonTimer';
import { announceToScreenReader } from '../../utils/screenReaderAnnouncer';

export default function LessonPage({ params }) {
  const router = useRouter();
  // Unwrap the params using React.use() as recommended by Next.js
  const unwrappedParams = use(params);
  const { lessonId } = unwrappedParams;
  
  const [activeTab, setActiveTab] = useState('content');
  const [activeSection, setActiveSection] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [allLessons, setAllLessons] = useState([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  
  // For teacher quiz management
  const [quizData, setQuizData] = useState(null);
  
  // Get auth context for role-based checks
  const { isTeacher, isAdmin, user } = useAuth();
  
  // Use our lesson timer hook
  const { 
    totalTimeSpent,
    totalTimeFormatted,
    pauseTimer
  } = useLessonTimer(lessonId);

  const updateBackendLessonCompletion = async (currentLessonId, isNowCompleted, currentTimeSpent) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Authentication token not found.');
      setError('Authentication token not found. Please log in again.');
      return;
    }

    try {
      let response;
      if (isNowCompleted) {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/progress/${currentLessonId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            completed: true,
            timeSpent: currentTimeSpent
          }),
        });
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/progress/${currentLessonId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            completed: false,
            timeSpent: currentTimeSpent 
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update lesson completion status to ${isNowCompleted}`);
      }

      console.log(`Lesson ${currentLessonId} completion status updated to ${isNowCompleted} on the backend.`);
      // Optionally, trigger a refresh of dashboard data or show a success message.

    } catch (err) {
      console.error('Error updating lesson completion status on backend:', err);
      setError(err.message);
    }
  };

  // Process lesson data to ensure it's in the right format
  const processLessonData = (data) => {
    // Ensure content is properly structured for rendering
    if (data.content && !data.sections) {
      // If there's content but no sections array, create a sections array with a single section
      data.sections = [{
        title: data.title || "Main Content",
        content: data.content
      }];
    } else if (!data.sections) {
      // If no sections, create a default empty one
      data.sections = [{
        title: data.title || "Main Content",
        content: "<p>No content available for this lesson.</p>"
      }];
    }
    
    // Ensure each section has the required properties
    data.sections = data.sections.map(section => ({
      ...section,
      title: section.title || "Untitled Section",
      content: section.content || "<p>No content available for this section.</p>"
    }));

    return data;
  };

  // Fetch the lesson data
  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching lesson with ID: ${lessonId}`);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${lessonId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/lessons/not-found');
            return;
          }
          throw new Error('Failed to fetch lesson');
        }
        
        const result = await response.json();
        console.log('Lesson API response:', result);
        
        // Extract the lesson from the response
        const rawLesson = result.data || {};
        
        // Process the lesson data to ensure it has the right structure
        const processedLesson = processLessonData(rawLesson);
        console.log('Processed lesson data:', processedLesson);
        
        setLessonData(processedLesson);
        
        // Check if the lesson is completed
        const completed = await isLessonCompleted(lessonId);
        setLessonCompleted(completed);
        
        // Check if there are quiz results already
        const existingQuizScore = getQuizScore(lessonId);
        if (existingQuizScore) {
          setQuizResults(existingQuizScore);
        }
        
        // If teacher or admin, also fetch the quiz data
        if (isTeacher || isAdmin) {
          fetchQuizData();
        }
        
        // Fetch all lessons for related content
        const allLessonsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons`);
        if (allLessonsResponse.ok) {
          const allLessonsData = await allLessonsResponse.json();
          setAllLessons(allLessonsData.data || []);
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to load lesson. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLessonData();
    }
  }, [lessonId, router, isTeacher, isAdmin]);
  
  // Add new useEffect to trigger quiz fetching when tab changes to 'quiz'
  useEffect(() => {
    // Only fetch quiz data when quiz tab is selected
    if (activeTab === 'quiz') {
      console.log('Quiz tab selected, fetching quiz data...');
      fetchQuizData();
    }
  }, [activeTab]);
  
  // Fetch quiz data separately (especially useful for teachers/admins)
  const fetchQuizData = async () => {
    try {
      console.log('Fetching quiz for lesson ID:', lessonId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/lesson/${lessonId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Quiz data received:', data);
        setQuizData(data.data);
      } else {
        // No quiz found or error
        console.log('No quiz found for this lesson or error fetching quiz:', response.status);
        setQuizData(null);
      }
    } catch (err) {
      console.error('Error fetching quiz data:', err);
      setQuizData(null);
    }
  };
  
  // Handle quiz creation/update from teacher
  const handleQuizCreated = (newQuizData) => {
    setQuizData(newQuizData);
    setIsEditingQuiz(false);
    // Show success message or notification
    announceToScreenReader('Quiz has been saved successfully');
  };

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
        if (e.key === 'ArrowRight' && activeTab === 'content' && lessonData?.sections) {
          nextSection();
          e.preventDefault();
        } else if (e.key === 'ArrowLeft' && activeTab === 'content') {
          prevSection();
          e.preventDefault();
        }
      }
      
      // Alt + number keys for tabs
      if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
        switch (e.key) {
          case '1': // Content tab
            setActiveTab('content');
            e.preventDefault();
            break;
          case '2': // Quiz tab
            setActiveTab('quiz');
            e.preventDefault();
            break;
          case '3': // Interactive tab
            setActiveTab('interactive');
            e.preventDefault();
            break;
          case 'o': // Toggle outline
          case 'O':
            toggleOutline();
            e.preventDefault();
            break;
          default:
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTab, activeSection, lessonData]);
  
  // Helper functions for navigation
  const nextSection = () => {
    if (!lessonData?.sections) return;
    
    if (activeSection < lessonData.sections.length - 1) {
      setActiveSection(activeSection + 1);
      announceToScreenReader(`Moved to section ${activeSection + 2} of ${lessonData.sections.length}`);
      window.scrollTo(0, 0);
    } else {
      announceToScreenReader('This is the last section');
    }
  };
  
  const prevSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      announceToScreenReader(`Moved to section ${activeSection} of ${lessonData?.sections?.length}`);
      window.scrollTo(0, 0);
    } else {
      announceToScreenReader('This is the first section');
    }
  };
  
  const toggleOutline = () => {
    setShowOutline(!showOutline);
    announceToScreenReader(showOutline ? 'Outline hidden' : 'Outline shown');
  };
  
  const handleQuizSubmit = (score, totalQuestions) => {
    saveQuizResults(lessonId, score, totalQuestions);
    setQuizResults({ score, totalQuestions });
    
    if (score / totalQuestions >= 0.7) {
      markLessonCompleted(lessonId); // Local storage update
      setLessonCompleted(true);     // Local UI state update
      announceToScreenReader(`Congratulations! You scored ${score} out of ${totalQuestions} and completed this lesson.`);
      updateBackendLessonCompletion(lessonId, true, totalTimeSpent); // Backend update
    } else {
      announceToScreenReader(`You scored ${score} out of ${totalQuestions}. You need 70% to complete this lesson.`);
    }
  };
  
  // If lesson is still loading, show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }
  
  // If there was an error loading the lesson
  if (error) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-lg text-center">
          <p>{error}</p>
          <div className="mt-4">
            <button 
              onClick={() => window.location.reload()} 
              className="mr-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
            <Link 
              href="/lessons" 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Back to Lessons
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // If no lesson data, show not found
  if (!lessonData) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Lesson Not Found</h2>
          <p>The lesson you're looking for doesn't exist or has been removed.</p>
          <div className="mt-4">
            <Link 
              href="/lessons" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Browse All Lessons
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Lesson Header */}
        <div className="mb-6 flex flex-wrap justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{lessonData?.title || "Lesson"}</h1>
            <div className="flex items-center">
              <LessonCompletionBadge 
                lessonId={lessonId} 
                onStatusChange={(status) => {
                  setLessonCompleted(status);
                  updateBackendLessonCompletion(lessonId, status, totalTimeSpent);
                }}
              />
              
              <div className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                <span>Time spent: </span>
                <span className="font-medium">{totalTimeFormatted}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link
              href="/lessons"
              className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Lessons
            </Link>
          </div>
        </div>
        
        {/* Progress Bar */}
        {lessonData?.sections && lessonData.sections.length > 0 && (
          <div className="mb-8">
            <ProgressBar 
              value={activeSection + 1} 
              max={lessonData.sections.length}
              label={`Section ${activeSection + 1} of ${lessonData.sections.length}`}
              size="md"
              color="primary"
            />
          </div>
        )}
        
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
        {showOutline && lessonData?.sections && lessonData.sections[activeSection] && (
          <div id="lesson-outline" className="mb-6 animate-fadeIn">
            <AccessibleOutline 
              htmlContent={lessonData.sections[activeSection].content}
              title="Section Outline"
              onHeadingClick={(heading) => {
                announceToScreenReader(`Navigated to heading: ${heading.text}`);
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
                announceToScreenReader('Content tab selected');
              }}
              className={`py-4 px-6 font-medium text-sm focus:outline-none focus:text-blue-700 ${
                activeTab === 'content'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={activeTab === 'content'}
              aria-controls="lesson-content"
              id="content-tab"
            >
              Content
              <span className="ml-1 text-xs text-gray-500">(Alt+1)</span>
            </button>
            
            <button
              onClick={() => {
                setActiveTab('quiz');
                announceToScreenReader('Quiz tab selected');
              }}
              className={`py-4 px-6 font-medium text-sm focus:outline-none focus:text-blue-700 ${
                activeTab === 'quiz'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={activeTab === 'quiz'}
              aria-controls="lesson-quiz"
              id="quiz-tab"
            >
              Quiz
              <span className="ml-1 text-xs text-gray-500">(Alt+2)</span>
            </button>
            
            {lessonData?.interactive && (
              <button
                onClick={() => {
                  setActiveTab('interactive');
                  announceToScreenReader('Interactive tab selected');
                }}
                className={`py-4 px-6 font-medium text-sm focus:outline-none focus:text-blue-700 ${
                  activeTab === 'interactive'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-selected={activeTab === 'interactive'}
                aria-controls="lesson-interactive"
                id="interactive-tab"
              >
                Interactive
                <span className="ml-1 text-xs text-gray-500">(Alt+3)</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('ask');
                announceToScreenReader('Ask Anything tab selected');
              }}
              className={`py-4 px-6 font-medium text-sm focus:outline-none focus:text-blue-700 ${
                activeTab === 'ask'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={activeTab === 'ask'}
              aria-controls="lesson-ask"
              id="ask-tab"
            >
              Ask Anything
            </button>
            <button
              onClick={() => {
                setActiveTab('faq');
                announceToScreenReader('FAQ tab selected');
              }}
              className={`py-4 px-6 font-medium text-sm focus:outline-none focus:text-blue-700 ${
                activeTab === 'faq'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={activeTab === 'faq'}
              aria-controls="lesson-faq"
              id="faq-tab"
            >
              FAQ
            </button>
          </nav>
        </div>
        
        {/* Content Tab */}
        <div
          id="lesson-content"
          role="tabpanel"
          aria-labelledby="content-tab"
          className={`prose max-w-none ${activeTab === 'content' ? 'block' : 'hidden'}`}
        >
          {lessonData?.sections && lessonData.sections.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">{lessonData.sections[activeSection].title}</h2>
              <div 
                className="lesson-content"
                dangerouslySetInnerHTML={{ __html: lessonData.sections[activeSection].content }}
              />
              
              {/* Navigation buttons */}
              <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
                <button
                  onClick={prevSection}
                  disabled={activeSection === 0}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    activeSection === 0
                      ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-400'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                  aria-label="Previous section"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                
                <div className="text-sm text-gray-600">
                  {`Section ${activeSection + 1} of ${lessonData.sections.length}`}
                </div>
                
                <button
                  onClick={nextSection}
                  disabled={activeSection === lessonData.sections.length - 1}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    activeSection === lessonData.sections.length - 1
                      ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-400'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  aria-label="Next section"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No content available for this lesson.</p>
          )}
        </div>
        
        {/* Quiz Tab - Displays either QuizCreator for teachers or Quiz for students */}
        <div
          id="lesson-quiz"
          role="tabpanel"
          aria-labelledby="quiz-tab"
          className={activeTab === 'quiz' ? 'block' : 'hidden'}
        >
          {/* For teachers and admins */}
          {(isTeacher || isAdmin) && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Quiz Management
                </h2>
                {quizData ? (
                  <Link
                    href={`/quizzes/${quizData._id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Edit Quiz
                  </Link>
                ) : (
                  <Link
                    href={`/quizzes/create?lessonId=${lessonId}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Create Quiz
                  </Link>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                    Quiz Status
                  </h3>
                  {quizData ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full dark:bg-green-900 dark:text-green-200">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full dark:bg-yellow-900 dark:text-yellow-200">
                      Not Created
                    </span>
                  )}
                </div>
                
                {quizData ? (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    This quiz has {quizData.questions?.length || 0} questions.
                  </p>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    No quiz has been created for this lesson yet. Click "Create Quiz" to make one.
                  </p>
                )}
                
                <div className="flex justify-end mt-4">
                  {quizData && (
                    <Link 
                      href={`/quizzes/${quizData._id}`} 
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View Quiz Page
                    </Link>
                  )}
                </div>
              </div>
              
              <hr className="my-8 border-gray-200 dark:border-gray-700" />
            </div>
          )}
          
          {/* For all users (including students) */}
          {!isTeacher && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Test Your Knowledge
              </h2>
              
              {quizData ? (
                <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
                  <div className="text-gray-700 dark:text-gray-300 mb-6">
                    <p>This lesson has a quiz available to test your knowledge on the material you've learned.</p>
                    <p className="mt-2">The quiz contains {quizData.questions?.length || 0} questions and will help reinforce the key concepts from this lesson.</p>
                  </div>
                  
                  {/* Show quiz status if user has results */}
                  {quizResults && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-md dark:bg-blue-900/30">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Your Previous Attempt</h4>
                      <p className="text-blue-700 dark:text-blue-300">
                        Score: {quizResults.score}/{quizResults.totalQuestions} ({Math.round((quizResults.score / quizResults.totalQuestions) * 100)}%)
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        {quizResults.score / quizResults.totalQuestions >= 0.7 ? "Passed" : "Not passed yet"}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-center">
                    <Link
                      href={`/quizzes/${quizData._id}`}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {quizResults ? "Retake Quiz" : "Take Quiz"}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300">
                  <p className="mb-2">No quiz available for this lesson yet.</p>
                  <p>Complete the lesson content to gain knowledge on this topic.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Interactive Tab */}
        <div
          id="lesson-interactive"
          role="tabpanel"
          aria-labelledby="interactive-tab"
          className={activeTab === 'interactive' ? 'block' : 'hidden'}
        >
          {lessonData?.interactive ? (
            <div 
              className="interactive-content"
              dangerouslySetInnerHTML={{ __html: lessonData.interactive }}
            />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300">
              <p>No interactive content available for this lesson.</p>
            </div>
          )}
        </div>

        {/* Ask Anything Tab */}
        <div
          id="lesson-ask"
          role="tabpanel"
          aria-labelledby="ask-tab"
          className={activeTab === 'ask' ? 'block' : 'hidden'}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Ask Anything</h2>
            <ChatBot lessonId={lessonId} lessonTitle={lessonData?.title} />
          </div>
        </div>
        
        {/* FAQ Tab */}
        <div
          id="lesson-faq"
          role="tabpanel"
          aria-labelledby="faq-tab"
          className={activeTab === 'faq' ? 'block' : 'hidden'}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            {lessonData?.faq?.length > 0 ? (
              <ul className="space-y-4">
                {lessonData.faq.map((item, idx) => (
                  <li key={idx} className="bg-white rounded-lg shadow-sm p-4">
                    <p className="font-medium">Q: {item.question}</p>
                    <p className="mt-1 text-gray-700">A: {item.answer}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No FAQs have been added for this lesson yet.</p>
            )}
          </div>
        </div>
        
        {/* Adaptive Learning Recommendations */}
        <div className="mt-10 pt-10 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Personalized Recommendations</h3>
          <AdaptiveLearningPath 
            currentLessonId={lessonId}
            allLessons={allLessons}
            onSelectLesson={(id) => {
              router.push(`/lessons/${id}`);
            }}
          />
        </div>
      </div>
      
      {/* Accessibility Components */}
      {activeTab === 'content' && lessonData?.sections && lessonData.sections.length > 0 && (
        <LessonNavigationAssistant
          htmlContent={lessonData.sections[activeSection]?.content || ''}
          onJumpToSection={(section) => setActiveSection(section)}
          currentSection={activeSection}
          totalSections={lessonData.sections.length}
          onPrevSection={prevSection}
          onNextSection={nextSection}
        />
      )}
      
      {showKeyboardShortcuts && (
        <LessonKeyboardShortcutsModal onClose={() => setShowKeyboardShortcuts(false)} />
      )}
    </div>
  );
}
