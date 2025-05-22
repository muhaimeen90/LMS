'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react'; // Add React.use import
import { useAuth } from '../../utils/AuthContext';
import { announceToScreenReader } from '../../utils/screenReaderAnnouncer';
import QuizResultModal from '../../components/QuizResultModal';

export default function QuizDetailPage({ params }) {
  // Properly unwrap the params using React.use
  const unwrappedParams = use(params);
  const quizId = unwrappedParams.id;
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [timeStarted, setTimeStarted] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  
  // States for enhanced XP modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [previousXP, setPreviousXP] = useState(0);
  const [previousLevel, setPreviousLevel] = useState(1);
  
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only enable keyboard navigation when quiz is loaded and not submitted
      if (!quiz || quizSubmitted) return;

      if (e.code === 'ArrowLeft' && activeQuestion > 0) {
        setActiveQuestion(prev => prev - 1);
        announceToScreenReader(`Previous question: ${activeQuestion} of ${quiz.questions.length}`);
      } else if (e.code === 'ArrowRight' && activeQuestion < quiz.questions.length - 1) {
        setActiveQuestion(prev => prev + 1);
        announceToScreenReader(`Next question: ${activeQuestion + 2} of ${quiz.questions.length}`);
      } else if (e.code.startsWith('Digit') && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const num = parseInt(e.code.replace('Digit', '')) - 1;
        const currentQuestion = quiz.questions[activeQuestion];
        if (num >= 0 && num < currentQuestion.options.length) {
          handleSelectAnswer(activeQuestion, currentQuestion.options[num].id);
          announceToScreenReader(`Selected option ${num + 1}: ${currentQuestion.options[num].text}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quiz, activeQuestion, quizSubmitted]);
  
  // Timer effect
  useEffect(() => {
    if (quiz && !quizSubmitted) {
      // Start the timer
      setTimeStarted(Date.now());
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);

      // If quiz has time limit
      if (quiz.timeLimit) {
        setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quiz, quizSubmitted]);
  
  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null || quizSubmitted) return;

    const countdownTimer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [timeRemaining, quizSubmitted]);
  
  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        console.log('Fetching quiz with ID:', quizId);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${quizId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }
        
        const result = await response.json();
        console.log('Quiz data:', result);
        setQuiz(result.data);
        
        // Announce to screen readers
        announceToScreenReader(`Quiz loaded: ${result.data.title} with ${result.data.questions.length} questions`);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz. Please try again later.');
        announceToScreenReader('Error loading quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
    
    // Get user's current XP and level
    if (isAuthenticated && user) {
      setPreviousXP(user.totalXP || 0);
      setPreviousLevel(user.level || 1);
    }
  }, [quizId, isAuthenticated, user]);
  
  // Handle answering questions
  const handleSelectAnswer = (questionIndex, answerId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerId
    });
    
    if (quiz?.questions[questionIndex]) {
      const question = quiz.questions[questionIndex];
      const selectedOption = question.options.find(opt => opt.id === answerId);
      announceToScreenReader(`Selected answer: ${selectedOption ? selectedOption.text : 'Unknown'}`);
    }
  };
  
  // Navigate to next question
  const goToNextQuestion = () => {
    if (activeQuestion < quiz.questions.length - 1) {
      setActiveQuestion(activeQuestion + 1);
      announceToScreenReader(`Question ${activeQuestion + 2} of ${quiz.questions.length}`);
    }
  };
  
  // Navigate to previous question
  const goToPrevQuestion = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(activeQuestion - 1);
      announceToScreenReader(`Question ${activeQuestion} of ${quiz.questions.length}`);
    }
  };
  
  // Check if all questions are answered
  const allQuestionsAnswered = quiz && quiz.questions && quiz.questions.length === Object.keys(selectedAnswers).length;
  
  // Handle quiz result modal close
  const handleResultModalClose = () => {
    setShowResultModal(false);
  };
  
  // Submit quiz
  const handleSubmitQuiz = async () => {
    try {
      // Calculate time taken in seconds
      const timeTaken = Math.round((Date.now() - timeStarted) / 1000);
      
      // Get token for authentication
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please sign in to submit the quiz.');
      }
      
      // Log the quiz structure for debugging
      console.log('Quiz structure:', quiz);
      console.log('Selected answers:', selectedAnswers);
      
      // Format answers for API - handle all possible option formats
      const formattedAnswers = Object.keys(selectedAnswers).map(qIndex => {
        const question = quiz.questions[qIndex];
        const optionId = selectedAnswers[qIndex];
        
        console.log(`Processing question ${qIndex}:`, question);
        console.log(`Selected optionId for question ${qIndex}:`, optionId);
        
        // Initialize with default
        let selectedAnswerText = optionId;
        
        // Different ways to extract the answer text based on various option formats
        if (Array.isArray(question.options)) {
          console.log(`Options type:`, typeof question.options[0]);
          
          // Case 1: Options are simple strings
          if (typeof question.options[0] === 'string') {
            const index = parseInt(optionId);
            if (!isNaN(index) && index >= 0 && index < question.options.length) {
              selectedAnswerText = question.options[index];
            }
          } 
          // Case 2: Options are objects with text property
          else if (typeof question.options[0] === 'object') {
            // Try finding by direct match of id/index
            const matchingOption = question.options.find(opt => 
              opt.id === optionId || 
              opt._id === optionId || 
              opt.text === optionId ||
              opt === optionId
            );
            
            if (matchingOption) {
              if (typeof matchingOption === 'string') {
                selectedAnswerText = matchingOption;
              } else if (matchingOption.text) {
                selectedAnswerText = matchingOption.text;
              }
            } 
            // Fallback: Try finding by index
            else {
              const index = parseInt(optionId);
              if (!isNaN(index) && index >= 0 && index < question.options.length) {
                const opt = question.options[index];
                selectedAnswerText = typeof opt === 'string' ? opt : opt.text || `Option ${index+1}`;
              }
            }
          }
        }
        
        // Ensure we're not submitting empty answers
        if (!selectedAnswerText || selectedAnswerText === "") {
          selectedAnswerText = optionId || "Option selected";
        }
        
        console.log(`Final answer text for question ${qIndex}:`, selectedAnswerText);
        
        return {
          questionId: question._id,
          selectedAnswer: selectedAnswerText
        };
      });
      
      console.log('Submitting quiz with answers:', formattedAnswers);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quizId: quizId,
          lessonId: quiz.lessonId,
          answers: formattedAnswers,
          timeTaken
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response from API:', errorData);
        throw new Error(errorData.message || 'Failed to submit quiz');
      }
      
      const result = await response.json();
      console.log('Quiz submission successful:', result);
      
      // For compatibility with different response formats
      const resultData = result.data?.attempt || result.data;
      const xpInfo = result.data?.xpInfo || {};
      const quizResult = result.data?.quizResult || {};
      
      setQuizResults({
        ...resultData,
        xpGained: quizResult.xpGained || xpInfo.xpGained || 0,
        xpBreakdown: quizResult.xpBreakdown || {},
        levelUp: quizResult.levelUp || xpInfo.leveledUp || false,
        newBadges: quizResult.newBadges || xpInfo.newBadges || []
      });
      
      setQuizSubmitted(true);
      
      // Open the result modal with the XP and level information
      setShowResultModal(true);
      
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Calculate and announce score
      const score = resultData.score;
      const total = quiz.questions.length;
      const percentage = resultData.percentage;
      
      announceToScreenReader(`Quiz completed. Your score is ${score} out of ${total}, which is ${percentage}%.`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz: ' + err.message);
      announceToScreenReader('Error submitting quiz: ' + err.message);
    }
  };
  
  // Reset quiz to try again
  const handleRestartQuiz = () => {
    setActiveQuestion(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizResults(null);
    setTimeStarted(Date.now());
    setTimer(0);
    setShowResultModal(false);
    
    // Reset time limit if there was one
    if (quiz.timeLimit) {
      setTimeRemaining(quiz.timeLimit * 60);
    }
    
    announceToScreenReader("Quiz restarted. You can now retake the quiz.");
  };
  
  // Format time in MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Format time in minutes and seconds text format
  const formatTimeText = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Render question navigator for desktop
  const renderQuestionNavigator = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {quiz.questions.map((question, index) => {
        const isAnswered = !!selectedAnswers[index];
        const isCurrent = index === activeQuestion;
        
        return (
          <button
            key={index}
            onClick={() => setActiveQuestion(index)}
            aria-label={`Question ${index + 1}${isAnswered ? ', answered' : ', not answered'}${isCurrent ? ', current question' : ''}`}
            aria-current={isCurrent ? 'step' : undefined}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center font-medium
              focus:ring-2 focus:ring-blue-500 focus:outline-none
              ${isCurrent 
                ? 'bg-blue-600 text-white border-2 border-blue-700' 
                : isAnswered
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }
            `}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-yellow-800 mb-2">Quiz Not Found</h2>
            <p className="text-yellow-700">The quiz you're looking for doesn't exist or has been removed.</p>
            <Link 
              href="/quizzes" 
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Browse All Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Show quiz taking interface
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="mb-8">
          <Link
            href="/quizzes"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Quizzes
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{quiz.title}</h1>
          
          {quiz.description && (
            <p className="mt-2 text-gray-600 dark:text-gray-300">{quiz.description}</p>
          )}
          
          <div className="flex flex-wrap items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="mr-6 mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Questions:</span> {quiz.questions.length}
            </div>
            
            {timeRemaining !== null && (
              <div className="mr-6 mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Time Remaining:</span> {formatTime(timeRemaining)}
              </div>
            )}
            
            <div className="mr-6 mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Time Elapsed:</span> {formatTime(timer)}
            </div>
            
            {quiz.passingScore && (
              <div className="mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Passing Score:</span> {quiz.passingScore}%
              </div>
            )}
          </div>
        </div>
        
        {/* Quiz Content */}
        <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800 overflow-hidden">
          {/* Question navigator for desktop */}
          <div className="px-6 pt-6 pb-3 overflow-x-auto hidden md:block">
            {renderQuestionNavigator()}
          </div>
          
          {/* Mobile question navigator - simplified */}
          <div className="flex items-center justify-between px-6 pt-6 pb-3 md:hidden">
            <button
              onClick={goToPrevQuestion}
              disabled={activeQuestion === 0}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
              aria-label="Previous question"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Question {activeQuestion + 1} of {quiz.questions.length}
              </span>
            </div>
            
            <button
              onClick={goToNextQuestion}
              disabled={activeQuestion === quiz.questions.length - 1 || !selectedAnswers[activeQuestion]}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
              aria-label="Next question"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="px-6 pb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {Math.round(Object.keys(selectedAnswers).length / quiz.questions.length * 100)}% Completed
              </span>
            </div>
            <div 
              className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(Object.keys(selectedAnswers).length / quiz.questions.length * 100)}
            >
              <div 
                className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-in-out dark:bg-blue-500"
                style={{width: `${Math.round(Object.keys(selectedAnswers).length / quiz.questions.length * 100)}%`}}
              ></div>
            </div>
          </div>
          
          {/* Current Question */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4" id="current-question">
              {quiz.questions[activeQuestion]?.text}
            </h3>
            
            <div className="space-y-3" role="radiogroup" aria-labelledby="current-question">
              {quiz.questions[activeQuestion]?.options && quiz.questions[activeQuestion].options.map((option, index) => {
                // Handle different option formats: string or object
                const optionId = typeof option === 'string' ? index : (option.id || option._id || index);
                const optionText = typeof option === 'string' ? option : option.text;
                
                console.log(`Option ${index}:`, { option, optionId, optionText });
                
                return (
                  <div 
                    key={index}
                    onClick={() => handleSelectAnswer(activeQuestion, optionId)}
                    className={`
                      p-4 rounded-md border cursor-pointer transition-all
                      ${selectedAnswers[activeQuestion] === optionId 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 dark:border-blue-700' 
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'}
                    `}
                    role="radio"
                    aria-checked={selectedAnswers[activeQuestion] === optionId}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectAnswer(activeQuestion, optionId);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <div className={`
                        flex-shrink-0 h-5 w-5 mr-2 rounded-full border
                        ${selectedAnswers[activeQuestion] === optionId 
                          ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400' 
                          : 'border-gray-300 dark:border-gray-600'}
                      `}>
                        {selectedAnswers[activeQuestion] === optionId && (
                          <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{optionText || `Option ${index + 1}`}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <div>
              <button
                type="button"
                onClick={goToPrevQuestion}
                disabled={activeQuestion === 0}
                className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${activeQuestion === 0
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
              >
                Previous
              </button>

              {activeQuestion < quiz.questions.length - 1 && (
                <button
                  type="button"
                  onClick={goToNextQuestion}
                  disabled={!selectedAnswers[activeQuestion]}
                  className={`ml-3 px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${!selectedAnswers[activeQuestion]
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                      : 'text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                    }`}
                >
                  Next
                </button>
              )}
            </div>
                
            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={!isAuthenticated || !allQuestionsAnswered}
              className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${!isAuthenticated || !allQuestionsAnswered
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                }`}
            >
              Submit Quiz
            </button>
          </div>
          
          {/* Authentication Warning */}
          {!isAuthenticated && (
            <div className="px-6 pb-6">
              <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm dark:bg-yellow-900/30 dark:text-yellow-200">
                <strong>Note:</strong> You need to sign in to submit this quiz and save your results.
                <Link href="/auth" className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  Sign In Now
                </Link>
              </div>
            </div>
          )}
          
          {!allQuestionsAnswered && (
            <div className="px-6 pb-6">
              <div className="text-sm text-amber-600 dark:text-amber-400">
                Please answer all questions before submitting the quiz.
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Show the QuizResultModal instead of the static results page */}
      <QuizResultModal
        isOpen={showResultModal}
        onClose={handleResultModalClose}
        quizResult={quizResults}
        previousXP={previousXP}
        previousLevel={previousLevel}
      />
    </div>
  );
}