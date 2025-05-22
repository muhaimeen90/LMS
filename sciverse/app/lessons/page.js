"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../utils/AuthContext';
import { useRouter } from 'next/navigation';

export default function LessonsPage() {
  const { isTeacher, isAdmin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Combined check for teacher or admin role
  const canCreateLesson = isTeacher || isAdmin;

  // Fetch lessons from the database
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch lessons');
        }
        
        const data = await response.json();
        setLessons(data.data || []);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Failed to load lessons. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">
            {isTeacher ? 'Manage Lessons' : 'Science Lessons'}
          </h1>
          
          {canCreateLesson && (
            <Link
              href="/lessons/create"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Create new lesson"
            >
              Create Lesson
            </Link>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading lessons...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-lg text-center">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {lessons.length > 0 ? (
              <div className="grid gap-6">
                {lessons.map(lesson => (
                  <div
                    key={lesson.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                    onClick={() => {
                      if (!isLoading && !isAuthenticated) {
                        router.push('/auth');
                      } else {
                        router.push(`/lessons/${lesson.id}`);
                      }
                    }}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-semibold mb-2">{lesson.title}</h2>
                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                              {lesson.difficulty}
                            </span>
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded mr-2">
                              {lesson.type}
                            </span>
                            {lesson.grade && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                {lesson.grade === 'undergraduate'
                                  ? 'Undergraduate'
                                  : lesson.grade.replace('grade', 'Grade ')}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-4">{lesson.description}</p>
                        </div>
                      </div>

                      {isTeacher ? (
                        <div className="flex space-x-3">
                          <Link 
                            href={`/quizzes/create?lessonId=${lesson.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                          >
                            Create Quiz
                          </Link>
                        </div>
                      ) : (
                        <Link 
                          href={`/lessons/${lesson.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLoading && !isAuthenticated) {
                              e.preventDefault();
                              router.push('/auth');
                            }
                          }}
                          className="inline-block bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label={`Start lesson: ${lesson.title}`}
                        >
                          Start Lesson
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-blue-50 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-semibold mb-4">No Lessons Available</h2>
                <p className="text-gray-700 mb-2">
                  There are currently no lessons available.
                </p>
                {canCreateLesson && (
                  <p className="text-gray-700 mt-4">
                    <Link
                      href="/lessons/create"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Create your first lesson
                    </Link>
                  </p>
                )}
              </div>
            )}
            
            {!isTeacher && (
              <div className="bg-blue-50 rounded-lg p-8 text-center mt-8">
                <h2 className="text-2xl font-semibold mb-4">More Lessons Coming Soon!</h2>
                <p className="text-gray-700 mb-2">
                  We're working on adding more interactive science lessons in various subjects.
                </p>
                <p className="text-gray-700">
                  Check back soon for lessons on Chemistry, Biology, Astronomy, and more!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
