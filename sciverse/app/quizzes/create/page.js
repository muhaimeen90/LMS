'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QuizCreator from '../../components/QuizCreator';
import { useAuth } from '../../utils/AuthContext';
import { announceToScreenReader } from '../../utils/screenReaderAnnouncer';

export default function CreateQuizPage() {
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [showCreator, setShowCreator] = useState(false);
  
  const { isAuthenticated, isTeacher, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if user is authorized to create quizzes
  useEffect(() => {
    if (!authLoading && isAuthenticated && !(isTeacher || isAdmin)) {
      router.push('/lessons');
      announceToScreenReader('You do not have permission to create quizzes');
    }
  }, [isAuthenticated, isTeacher, isAdmin, router, authLoading]);
  
  // Fetch lessons for selection
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons`);
        if (!response.ok) {
          throw new Error('Failed to fetch lessons');
        }
        
        const result = await response.json();
        setLessons(result.data || []);
        
        // Check if lessonId is provided in URL params
        const lessonIdFromURL = searchParams.get('lessonId');
        if (lessonIdFromURL) {
          setSelectedLessonId(lessonIdFromURL);
          setShowCreator(true);
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && (isTeacher || isAdmin)) {
      fetchLessons();
    }
  }, [isAuthenticated, isTeacher, isAdmin, searchParams]);
  
  // Handle lesson selection and proceed to quiz creation
  const handleLessonSelect = (e) => {
    e.preventDefault();
    
    if (!selectedLessonId) {
      announceToScreenReader('Please select a lesson before continuing');
      return;
    }
    
    setShowCreator(true);
    announceToScreenReader('Lesson selected. You can now create your quiz');
  };
  
  // Handle quiz creation success
  const handleQuizCreated = (quizData) => {
    if (quizData) {
      announceToScreenReader('Quiz created successfully');
      router.push('/quizzes');
    } else {
      setShowCreator(false);
      setSelectedLessonId('');
      announceToScreenReader('Quiz creation cancelled');
    }
  };
  
  if (authLoading || (loading && isAuthenticated && (isTeacher || isAdmin))) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/quizzes"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Quizzes
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">Create New Quiz</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Create a quiz to test student knowledge on a specific lesson.
          </p>
        </div>
        
        {!showCreator ? (
          <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Step 1: Select a Lesson
            </h2>
            
            <form onSubmit={handleLessonSelect} className="space-y-6">
              <div>
                <label htmlFor="lesson-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lesson <span className="text-red-500">*</span>
                </label>
                <select
                  id="lesson-select"
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="" disabled>Select a lesson</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Select the lesson this quiz will be associated with
                </p>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedLessonId}
                >
                  Continue to Quiz Creation
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Step 2: Create Quiz Content
            </h2>
            
            <QuizCreator 
              lessonId={selectedLessonId} 
              onQuizCreated={handleQuizCreated}
            />
          </div>
        )}
      </div>
    </div>
  );
}