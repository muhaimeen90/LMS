'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProgressBar from './ProgressBar';
import LessonCompletionBadge from './LessonCompletionBadge';
import QuizScoreCard from './QuizScoreCard';
import { 
  calculateOverallProgress, 
  getRecommendedLesson,
  getAllProgress
} from '../utils/storageUtils';

/**
 * PersonalizedDashboard - Displays user progress and recommendations
 * 
 * @param {Object} props
 * @param {Array} props.lessons - Array of all available lessons
 */
const PersonalizedDashboard = ({ lessons = [] }) => {
  const [overallProgress, setOverallProgress] = useState(0);
  const [recommendedLesson, setRecommendedLesson] = useState(null);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && lessons.length > 0) {
      // Calculate overall progress
      const progress = calculateOverallProgress(lessons);
      setOverallProgress(progress);
      
      // Get recommended next lesson
      const recommended = getRecommendedLesson(lessons);
      setRecommendedLesson(recommended);
      
      // Get all progress data
      const allProgress = getAllProgress();
      setProgressData(allProgress);
      
      setLoading(false);
    }
  }, [lessons]);
  
  // Handle status change (lesson completed/uncompleted)
  const handleStatusChange = () => {
    if (typeof window !== 'undefined' && lessons.length > 0) {
      // Recalculate overall progress
      const progress = calculateOverallProgress(lessons);
      setOverallProgress(progress);
      
      // Update recommended lesson
      const recommended = getRecommendedLesson(lessons);
      setRecommendedLesson(recommended);
      
      // Update progress data
      const allProgress = getAllProgress();
      setProgressData(allProgress);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Loading your personalized dashboard...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Your Learning Progress
        </h2>
        
        <ProgressBar 
          value={overallProgress} 
          max={100} 
          label="Overall Progress" 
          size="lg"
          color="primary"
        />
        
        {/* Recommended Lesson */}
        {recommendedLesson && (
          <div className="mt-6 animate-fadeIn">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              Recommended Next Lesson
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/30 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                {recommendedLesson.title}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                {recommendedLesson.description ? 
                  recommendedLesson.description.substring(0, 120) + '...' : 
                  'Continue your learning journey with this recommended lesson.'}
              </p>
              <div className="flex justify-between items-center">
                <LessonCompletionBadge 
                  lessonId={recommendedLesson.id} 
                  showButton={false}
                  size="sm"
                />
                <Link 
                  href={`/lessons/${recommendedLesson.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  aria-label={`Go to recommended lesson: ${recommendedLesson.title}`}
                >
                  Start Lesson
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Lessons List */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Your Lessons
        </h3>
        
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div 
              key={lesson.id}
              className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    {lesson.title}
                  </h4>
                  <LessonCompletionBadge 
                    lessonId={lesson.id} 
                    onStatusChange={handleStatusChange}
                    size="sm"
                  />
                </div>
                <Link 
                  href={`/lessons/${lesson.id}`}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  aria-label={`Go to lesson: ${lesson.title}`}
                >
                  View Lesson
                </Link>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quiz Score Summary */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quiz Performance
                    </h5>
                    <QuizScoreCard lessonId={lesson.id} />
                  </div>
                  
                  {/* Time Spent */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time Spent
                    </h5>
                    <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                      {progressData[`lesson_${lesson.id}_timeSpent`] ? (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span 
                            className="text-lg font-semibold text-gray-700 dark:text-gray-300"
                            aria-label={`Time spent on this lesson: ${formatTime(progressData[`lesson_${lesson.id}_timeSpent`])} hours`}
                          >
                            {formatTime(progressData[`lesson_${lesson.id}_timeSpent`])}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No time tracked yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to format time (seconds to HH:MM:SS)
const formatTime = (seconds) => {
  if (!seconds) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

export default PersonalizedDashboard;
