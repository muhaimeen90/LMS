'use client';

import { useState, useEffect } from 'react';
import { getQuizScore } from '../utils/storageUtils';
import { announceToScreenReader } from '../utils/screenReaderAnnouncer';
import { 
  processQuizSubmission, 
  calculateScorePercentage, 
  isQuizPassed,
  getScoreColorClass
} from '../utils/quizUtils';

/**
 * Quiz component for lesson quizzes
 * 
 * @param {Object} props
 * @param {string} props.lessonId - The lesson identifier
 * @param {Array} props.questions - Array of quiz questions
 * @param {Function} props.onComplete - Callback when quiz is completed
 */
const Quiz = ({ 
  lessonId, 
  questions = [],
  onComplete 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [previousAttempts, setPreviousAttempts] = useState(null);
  
  // Load previous quiz data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const quizData = getQuizScore(lessonId);
      if (quizData) {
        setPreviousAttempts(quizData);
      }
      
      // Announce quiz loaded
      announceToScreenReader(`Quiz loaded with ${questions.length} questions. ${
        quizData ? `Your previous score was ${quizData.score} out of ${quizData.totalQuestions}.` : ''
      }`);
    }
  }, [lessonId, questions.length]);
  
  // Handle answer selection
  const handleSelectAnswer = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    });
    
    // Announce selection
    const option = questions[questionIndex].options[answerIndex];
    announceToScreenReader(`Selected answer: ${option.text}`);
  };
  
  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      announceToScreenReader(`Question ${currentQuestionIndex + 2} of ${questions.length}: ${questions[currentQuestionIndex + 1].question}`);
    }
  };
  
  // Move to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      announceToScreenReader(`Question ${currentQuestionIndex} of ${questions.length}: ${questions[currentQuestionIndex - 1].question}`);
    }
  };
  
  // Submit quiz
  const handleSubmitQuiz = () => {
    // Process submission using centralized utility
    const result = processQuizSubmission(lessonId, questions, selectedAnswers);
    
    // Set score and completion state
    setScore(result.score);
    setQuizCompleted(true);
    
    // Announce result
    announceToScreenReader(
      `Quiz completed. Your score is ${result.score} out of ${result.totalQuestions}, which is ${result.percentage} percent.`
    );
    
    // Callback
    if (onComplete) {
      onComplete(result);
    }
  };
  
  // Reset quiz to try again
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
    announceToScreenReader("Quiz restarted. You can now retake the quiz.");
  };
  
  // Current question
  const currentQuestion = questions[currentQuestionIndex];
  
  // Progress percentage
  const progressPercentage = Math.round(
    ((Object.keys(selectedAnswers).length) / questions.length) * 100
  );
  
  if (!currentQuestion) {
    return (
      <div className="p-4 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/30 dark:border-red-800">
        <p className="text-red-500 dark:text-red-400">
          No questions available for this quiz.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800 overflow-hidden">
      {/* Previous attempts info */}
      {previousAttempts && !quizCompleted && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 dark:bg-blue-900/30 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Previous attempt: {previousAttempts.score}/{previousAttempts.totalQuestions} 
                ({calculateScorePercentage(previousAttempts.score, previousAttempts.totalQuestions)}%)
              </p>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-400">
              Attempts: {previousAttempts.attempts}
            </div>
          </div>
        </div>
      )}
      
      {/* Quiz in progress */}
      {!quizCompleted ? (
        <>
          {/* Progress bar */}
          <div className="px-6 pt-6 pb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {Math.round((currentQuestionIndex + 1) / questions.length * 100)}% Complete
              </span>
            </div>
            <div 
              className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round((currentQuestionIndex + 1) / questions.length * 100)}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div 
                className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${Math.round((currentQuestionIndex + 1) / questions.length * 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Question */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              {currentQuestion.question}
            </h3>
            
            <div className="space-y-3">
              {currentQuestion.options.map((opt, answerIndex) => (
                <div key={answerIndex} className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={`answer-${answerIndex}`}
                      name={`question-${currentQuestionIndex}`}
                      type="radio"
                      checked={selectedAnswers[currentQuestionIndex] === answerIndex}
                      onChange={() => handleSelectAnswer(currentQuestionIndex, answerIndex)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      aria-label={`Answer option ${answerIndex + 1}: ${opt.text}`}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label 
                      htmlFor={`answer-${answerIndex}`} 
                      className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      {opt.text}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <button
              type="button"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                ${currentQuestionIndex === 0 
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed dark:text-gray-500 dark:bg-gray-700' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
              aria-label="Previous question"
            >
              Previous
            </button>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${selectedAnswers[currentQuestionIndex] === undefined
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed dark:text-gray-500 dark:bg-gray-700'
                    : 'text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'}`}
                aria-label="Next question"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={progressPercentage < 100}
                className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${progressPercentage < 100
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed dark:text-gray-500 dark:bg-gray-700'
                    : 'text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'}`}
                aria-label="Submit quiz"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </>
      ) : (
        // Quiz results
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Quiz Results
            </h3>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {score}/{questions.length}
              </span>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              You scored {calculateScorePercentage(score, questions.length)}%
            </p>
            
            {!isQuizPassed(score, questions.length, 50) && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300">
                We recommend reviewing this lesson again before moving on.
              </div>
            )}
            
            {isQuizPassed(score, questions.length, 80) && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
                Great job! You're ready to move on to the next lesson.
              </div>
            )}
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={handleRestartQuiz}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
              aria-label="Try quiz again"
            >
              Try Again
            </button>
          </div>
          
          {/* Question review */}
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              Review Questions
            </h4>
            
            <div className="space-y-6">
              {questions.map((question, qIndex) => {
                const userAnswer = selectedAnswers[qIndex];
                const isCorrect = userAnswer === question.options.findIndex(opt => opt.id === question.correctOptionId);
                
                return (
                  <div 
                    key={qIndex}
                    className={`p-4 rounded-lg border ${
                      isCorrect
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30'
                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30'
                    }`}
                  >
                    <h5 className="font-medium text-gray-800 dark:text-white mb-3">
                      {qIndex + 1}. {question.question}
                    </h5>
                    
                    <div className="space-y-2">
                      {question.options.map((opt, aIndex) => (
                        <div 
                          key={aIndex}
                          className={`p-2 rounded ${
                            opt.id === question.correctOptionId
                              ? 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-100'
                              : aIndex === userAnswer && opt.id !== question.correctOptionId
                                ? 'bg-red-100 text-red-800 dark:bg-red-800/50 dark:text-red-100'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-2">
                              {opt.id === question.correctOptionId && (
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                              {aIndex === userAnswer && opt.id !== question.correctOptionId && (
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                              )}
                            </div>
                            <span>{opt.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {question.explanation && (
                      <div className="mt-3 text-sm italic text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Explanation:</span> {question.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
