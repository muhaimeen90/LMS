"use client";

import { useState, useEffect } from 'react';
import { lessonData } from '../../data/lessonData';
import { saveProgress, loadProgress } from '../../utils/themeUtils';
import Link from 'next/link';

export default function LessonPage({ params }) {
  const [activeTab, setActiveTab] = useState('content');
  const [activeSection, setActiveSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  // Load progress data from localStorage on initial mount
  useEffect(() => {
    const savedProgress = loadProgress(lessonData.id);
    if (savedProgress) {
      setActiveSection(savedProgress.section || 0);
      setQuizAnswers(savedProgress.quizAnswers || {});
      setQuizSubmitted(savedProgress.quizSubmitted || false);
      setScore(savedProgress.score || 0);
      
      // Calculate progress percentage based on sections completed
      const totalSections = lessonData.sections.length;
      const completedSections = savedProgress.section + 1;
      const quizCompletion = savedProgress.quizSubmitted ? 1 : 0;
      const calculatedProgress = ((completedSections / (totalSections + 1)) * 100) + 
                                 ((quizCompletion / (totalSections + 1)) * 100);
      
      setProgressPercent(Math.min(calculatedProgress, 100));
    }
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    const progress = {
      section: activeSection,
      quizAnswers,
      quizSubmitted,
      score
    };
    
    saveProgress(lessonData.id, progress);
    
    // Calculate progress percentage
    const totalSections = lessonData.sections.length;
    const completedSections = activeSection + 1;
    const quizCompletion = quizSubmitted ? 1 : 0;
    const calculatedProgress = ((completedSections / (totalSections + 1)) * 100) + 
                             ((quizCompletion / (totalSections + 1)) * 100);
    
    setProgressPercent(Math.min(calculatedProgress, 100));
  }, [activeSection, quizAnswers, quizSubmitted, score]);

  // Handle quiz answer selection
  const handleAnswerSelect = (questionId, optionId) => {
    if (quizSubmitted) return; // Prevent changes after submission
    
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: optionId
    });
  };

  // Submit quiz and calculate score
  const submitQuiz = () => {
    let correctAnswers = 0;
    
    lessonData.quiz.questions.forEach(question => {
      if (quizAnswers[question.id] === question.correctOptionId) {
        correctAnswers++;
      }
    });
    
    const calculatedScore = Math.round((correctAnswers / lessonData.quiz.questions.length) * 100);
    setScore(calculatedScore);
    setQuizSubmitted(true);
  };

  // Navigate to next section
  const nextSection = () => {
    if (activeSection < lessonData.sections.length - 1) {
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
                  {lessonData.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{lessonData.title}</h1>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Your Progress</span>
            <span className="text-sm font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progressPercent)}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex -mb-px" aria-label="Lesson tabs">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm focus:outline-none ${
                activeTab === 'content'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={activeTab === 'content'}
              aria-controls="content-panel"
              id="content-tab"
            >
              Lesson Content
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm focus:outline-none ${
                activeTab === 'quiz'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={activeTab === 'quiz'}
              aria-controls="quiz-panel"
              id="quiz-tab"
            >
              Knowledge Check
            </button>
            <button
              onClick={() => setActiveTab('interactive')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm focus:outline-none ${
                activeTab === 'interactive'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={activeTab === 'interactive'}
              aria-controls="interactive-panel"
              id="interactive-tab"
            >
              Interactive Elements
            </button>
          </nav>
        </div>
        
        {/* Lesson Content Tab */}
        <div 
          id="content-panel"
          role="tabpanel"
          aria-labelledby="content-tab"
          className={activeTab === 'content' ? 'block' : 'hidden'}
        >
          {/* Section Title */}
          <h2 className="text-2xl font-semibold mb-4">
            {lessonData.sections[activeSection].title}
          </h2>
          
          {/* Section Navigation */}
          <div className="flex items-center mb-4">
            <div className="text-sm font-medium">
              Section {activeSection + 1} of {lessonData.sections.length}
            </div>
          </div>
          
          {/* Section Content */}
          <div 
            className="prose max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: lessonData.sections[activeSection].content }}
          ></div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevSection}
              disabled={activeSection === 0}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeSection === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              aria-label="Previous section"
            >
              Previous
            </button>
            <button
              onClick={nextSection}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={activeSection < lessonData.sections.length - 1 ? "Next section" : "Go to quiz"}
            >
              {activeSection < lessonData.sections.length - 1 ? 'Next' : 'Go to Quiz'}
            </button>
          </div>
        </div>
        
        {/* Quiz Tab */}
        <div 
          id="quiz-panel"
          role="tabpanel"
          aria-labelledby="quiz-tab"
          className={activeTab === 'quiz' ? 'block' : 'hidden'}
        >
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">{lessonData.quiz.title}</h2>
            
            {quizSubmitted ? (
              // Quiz Results
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
                  <span className="text-2xl font-bold text-blue-600">{score}%</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Quiz Completed!
                </h3>
                <p className="mb-6">
                  You scored {score}% on this quiz. 
                  {score >= 80 
                    ? ' Great job! You have a solid understanding of this topic.' 
                    : ' Keep reviewing the material to improve your understanding.'}
                </p>
                
                {/* Review Answers */}
                <div className="text-left mt-8">
                  <h3 className="text-lg font-semibold mb-4">Review Your Answers</h3>
                  
                  {lessonData.quiz.questions.map((question, index) => {
                    const isCorrect = quizAnswers[question.id] === question.correctOptionId;
                    const correctOption = question.options.find(option => option.id === question.correctOptionId);
                    
                    return (
                      <div key={question.id} className="mb-8 p-4 rounded-lg border border-gray-200">
                        <p className="font-medium mb-2">
                          {index + 1}. {question.question}
                        </p>
                        
                        <div className={`p-2 rounded-lg mb-2 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                          <p className="font-medium">
                            Your answer: {question.options.find(option => option.id === quizAnswers[question.id])?.text || 'Not answered'}
                          </p>
                          
                          {!isCorrect && (
                            <p className="text-green-700 mt-1">
                              Correct answer: {correctOption?.text}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setActiveTab('content')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Review Lesson Material
                </button>
              </div>
            ) : (
              // Quiz Questions
              <form>
                {lessonData.quiz.questions.map((question, index) => (
                  <div key={question.id} className="mb-8">
                    <p className="font-medium mb-4">
                      {index + 1}. {question.question}
                    </p>
                    
                    <div className="space-y-2">
                      {question.options.map(option => (
                        <div key={option.id} className="flex items-center">
                          <input
                            type="radio"
                            id={option.id}
                            name={question.id}
                            value={option.id}
                            checked={quizAnswers[question.id] === option.id}
                            onChange={() => handleAnswerSelect(question.id, option.id)}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            aria-labelledby={`label-${option.id}`}
                          />
                          <label
                            id={`label-${option.id}`}
                            htmlFor={option.id}
                            className="ml-3 block text-gray-700"
                          >
                            {option.text}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={submitQuiz}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Submit Quiz
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Interactive Elements Tab */}
        <div 
          id="interactive-panel"
          role="tabpanel"
          aria-labelledby="interactive-tab"
          className={activeTab === 'interactive' ? 'block' : 'hidden'}
        >
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Interactive Learning Elements</h2>
            
            <div className="space-y-8">
              {lessonData.interactiveElements.map((element) => (
                <div key={element.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-2">{element.title}</h3>
                  <p className="text-gray-700 mb-4">{element.description}</p>
                  
                  <div className="bg-gray-100 p-8 rounded-lg text-center">
                    <p className="text-gray-500 italic">
                      [Interactive element placeholder - {element.title}]
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      This is a placeholder for a future interactive element.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
