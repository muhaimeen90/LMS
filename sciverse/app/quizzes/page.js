'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { announceToScreenReader } from '../utils/screenReaderAnnouncer';
import { useAuth } from '../utils/AuthContext';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { isTeacher, isAdmin } = useAuth();

  // Check if user can create quizzes
  const canCreateQuiz = isTeacher || isAdmin;

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use environment variable for API URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const endpoint = `${apiUrl}/api/quizzes`;
        
        console.log('Fetching quizzes from:', endpoint);
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Error response:', errorData);
          throw new Error(errorData?.message || `Failed to fetch quizzes: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API response:', result);
        
        // Handle different response formats
        const quizzesData = result.data?.data || result.data || result || [];
        
        console.log('Final quizzes data:', quizzesData);
        setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
        announceToScreenReader(`${quizzesData.length || 0} quizzes available`);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError(err.message || 'Failed to load quizzes. Please try again later.');
        announceToScreenReader('Error loading quizzes');
      } finally {
        setLoading(false);
      }
    };
  
    fetchQuizzes();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Available Quizzes
      </h1>
      
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Try again
          </button>
        </div>
      )}
      
      {!loading && !error && quizzes.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300">
          <p>No quizzes available at the moment.</p>
          <Link 
            href="/lessons" 
            className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Browse lessons instead
          </Link>
        </div>
      )}
      
      {!loading && !error && quizzes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div 
              key={quiz._id || quiz.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105 hover:shadow-lg dark:bg-gray-800 dark:border dark:border-gray-700"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {quiz.title}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {quiz.description || 'No description available.'}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>
                    {new Date(quiz.createdAt || quiz.created_at).toLocaleDateString()}
                  </span>
                  
                  <span className="mx-2">•</span>
                  
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <span>
                    {quiz.questions ? quiz.questions.length : 0} Questions
                  </span>
                </div>
                
                <div className="mt-auto">
                  <Link 
                    href={`/quizzes/${quiz._id || quiz.id}`}
                    className="inline-block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-center rounded-md transition-colors duration-300 dark:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    Take Quiz
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 py-4 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Your Recent Quiz Attempts
        </h2>
        
        {/* This section would show recent attempts, but requires authentication integration */}
        <p className="text-gray-600 dark:text-gray-400">
          Sign in to view your quiz history and track your progress.
        </p>
      </div>
      
      {canCreateQuiz && (
        <div className="mt-8">
          <Link 
            href="/quizzes/create"
            className="inline-block py-3 px-5 bg-green-600 hover:bg-green-700 text-white font-medium text-center rounded-md transition-colors duration-300 dark:bg-green-700 dark:hover:bg-green-600"
          >
            Create New Quiz
          </Link>
        </div>
      )}
    </div>
  );
}