'use client';

import { useState, useEffect } from 'react';
import { getQuizScore } from '../utils/storageUtils';

/**
 * QuizScoreCard - Display quiz score and attempt information
 * 
 * @param {Object} props
 * @param {string} props.lessonId - The lesson identifier
 * @param {string} props.variant - Display variant (compact, detailed)
 */
const QuizScoreCard = ({ 
  lessonId, 
  variant = 'detailed' 
}) => {
  const [quizData, setQuizData] = useState(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = getQuizScore(lessonId);
      setQuizData(data);
    }
  }, [lessonId]);
  
  if (!quizData) {
    return variant === 'compact' ? (
      <span className="text-sm text-gray-500 dark:text-gray-400">No attempts yet</span>
    ) : (
      <div className="text-center p-4 border border-gray-200 rounded-lg dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No quiz attempts for this lesson yet</p>
      </div>
    );
  }
  
  // Calculate score percentage
  const scorePercent = Math.round((quizData.score / quizData.totalQuestions) * 100);
  
  // Format date
  const formattedDate = quizData.lastAttemptTime ? 
    new Date(quizData.lastAttemptTime).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';
  
  // Determine score color based on percentage
  let scoreColorClass = 'text-yellow-500 dark:text-yellow-400';
  if (scorePercent >= 80) {
    scoreColorClass = 'text-green-500 dark:text-green-400';
  } else if (scorePercent < 50) {
    scoreColorClass = 'text-red-500 dark:text-red-400';
  }
  
  if (variant === 'compact') {
    return (
      <span 
        className={`font-medium ${scoreColorClass}`}
        aria-label={`Quiz score: ${quizData.score} out of ${quizData.totalQuestions}`}
      >
        {quizData.score}/{quizData.totalQuestions}
      </span>
    );
  }
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
      <div className="text-center mb-3">
        <h3 className="text-lg font-semibold mb-1">Quiz Results</h3>
        <div className="flex items-center justify-center">
          <span 
            className={`text-2xl font-bold ${scoreColorClass}`}
            aria-label={`Quiz score: ${quizData.score} out of ${quizData.totalQuestions}`}
          >
            {quizData.score}/{quizData.totalQuestions}
          </span>
          <span className={`ml-2 text-lg font-medium ${scoreColorClass}`}>
            ({scorePercent}%)
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400">Attempts:</span>
          <span className="font-medium">{quizData.attempts}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400">Last attempt:</span>
          <span className="font-medium">{formattedDate}</span>
        </div>
      </div>
      
      {scorePercent < 50 && (
        <div className="mt-3 text-center">
          <p className="text-sm text-red-500 dark:text-red-400">
            We recommend reviewing this lesson again.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizScoreCard;
