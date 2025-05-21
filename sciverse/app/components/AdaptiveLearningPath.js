'use client';

import { useState, useEffect } from 'react';
import { getQuizScore, isLessonCompleted } from '../utils/storageUtils';

/**
 * AdaptiveLearningPath - Suggests next steps based on user progress
 * 
 * @param {Object} props
 * @param {string} props.currentLessonId - The current lesson identifier
 * @param {Array} props.allLessons - All available lessons
 * @param {Function} props.onSelectLesson - Callback when a lesson is selected
 */
const AdaptiveLearningPath = ({ 
  currentLessonId, 
  allLessons = [],
  onSelectLesson 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [quizStatus, setQuizStatus] = useState(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && allLessons.length > 0) {
      // Get quiz status for current lesson
      const quizData = getQuizScore(currentLessonId);
      setQuizStatus(quizData);
      
      // Generate recommendations based on progress
      generateRecommendations(quizData);
    }
  }, [currentLessonId, allLessons]);
  
  const generateRecommendations = (quizData) => {
    const currentLessonIndex = allLessons.findIndex(lesson => lesson.id === currentLessonId);
    if (currentLessonIndex === -1) return;
    
    const isCurrentLessonCompleted = isLessonCompleted(currentLessonId);
    
    let recommendedLessons = [];
    
    // Logic for recommendations
    if (quizData && quizData.score !== null) {
      const scorePercentage = (quizData.score / quizData.totalQuestions) * 100;
      
      if (scorePercentage < 50) {
        // Low score - recommend reviewing current lesson and prerequisites
        recommendedLessons.push({
          id: currentLessonId,
          title: allLessons[currentLessonIndex].title,
          type: 'review',
          message: 'Review this lesson again to improve your understanding'
        });
        
        // Add prerequisite lesson if available
        if (currentLessonIndex > 0) {
          recommendedLessons.push({
            id: allLessons[currentLessonIndex - 1].id,
            title: allLessons[currentLessonIndex - 1].title,
            type: 'prerequisite',
            message: 'You may want to revisit this prerequisite lesson'
          });
        }
      } else if (scorePercentage >= 50 && scorePercentage < 80) {
        // Medium score - recommend current lesson and next lesson
        if (!isCurrentLessonCompleted) {
          recommendedLessons.push({
            id: currentLessonId,
            title: allLessons[currentLessonIndex].title,
            type: 'review',
            message: 'Consider reviewing some parts of this lesson'
          });
        }
        
        // Add next lesson if available
        if (currentLessonIndex < allLessons.length - 1) {
          recommendedLessons.push({
            id: allLessons[currentLessonIndex + 1].id,
            title: allLessons[currentLessonIndex + 1].title,
            type: 'next',
            message: 'You\'re ready to proceed to the next lesson'
          });
        }
      } else {
        // High score - recommend next lesson and advanced topics
        // Add next lesson if available
        if (currentLessonIndex < allLessons.length - 1) {
          recommendedLessons.push({
            id: allLessons[currentLessonIndex + 1].id,
            title: allLessons[currentLessonIndex + 1].title,
            type: 'next',
            message: 'Great job! You\'re ready for the next lesson'
          });
          
          // Add advanced lesson if available
          if (currentLessonIndex < allLessons.length - 2) {
            recommendedLessons.push({
              id: allLessons[currentLessonIndex + 2].id,
              title: allLessons[currentLessonIndex + 2].title,
              type: 'advanced',
              message: 'You\'re doing well! Consider this advanced lesson'
            });
          }
        } else {
          // If this is the last lesson
          recommendedLessons.push({
            id: null,
            title: 'You\'ve completed all lessons!',
            type: 'completed',
            message: 'Congratulations on your progress'
          });
        }
      }
    } else {
      // No quiz taken yet
      if (!isCurrentLessonCompleted) {
        recommendedLessons.push({
          id: currentLessonId,
          title: allLessons[currentLessonIndex].title,
          type: 'current',
          message: 'Complete this lesson and take the quiz'
        });
      } else {
        // Lesson completed but no quiz
        if (currentLessonIndex < allLessons.length - 1) {
          recommendedLessons.push({
            id: allLessons[currentLessonIndex + 1].id,
            title: allLessons[currentLessonIndex + 1].title,
            type: 'next',
            message: 'You\'re ready to proceed to the next lesson'
          });
        }
      }
    }
    
    setRecommendations(recommendedLessons);
  };
  
  // Get background color based on recommendation type
  const getTypeStyles = (type) => {
    switch (type) {
      case 'review':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800';
      case 'prerequisite':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800';
      case 'current':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800';
      case 'next':
        return 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800';
      case 'advanced':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800';
      case 'completed':
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };
  
  // Get icon based on recommendation type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'review':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        );
      case 'prerequisite':
        return (
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
          </svg>
        );
      case 'current':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        );
      case 'next':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
          </svg>
        );
      case 'advanced':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Your Personalized Learning Path
        </h3>
        {quizStatus && (
          <div className="mt-2 flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
              Quiz Score:
            </span>
            <span className="font-medium">
              {quizStatus.score}/{quizStatus.totalQuestions}
            </span>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({Math.round((quizStatus.score / quizStatus.totalQuestions) * 100)}%)
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 ${getTypeStyles(recommendation.type)}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    {getTypeIcon(recommendation.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      {recommendation.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {recommendation.message}
                    </p>
                    
                    {recommendation.id && (
                      <button
                        onClick={() => onSelectLesson && onSelectLesson(recommendation.id)}
                        className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        aria-label={`Go to ${recommendation.title}`}
                      >
                        Go to this lesson →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Complete this lesson or take the quiz to get personalized recommendations.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdaptiveLearningPath;
