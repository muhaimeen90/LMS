'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../utils/AuthContext';
import { announceToScreenReader } from '../utils/screenReaderAnnouncer';

const QuizCreator = ({ lessonId, existingQuiz = null, onQuizCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(70); // Default passing score 70%
  const [timeLimit, setTimeLimit] = useState(30); // Default time limit 30 minutes
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const { isAuthenticated, isTeacher, isAdmin } = useAuth();
  const router = useRouter();
  
  // Initialize with existing quiz data if provided
  useEffect(() => {
    if (existingQuiz) {
      setTitle(existingQuiz.title);
      setDescription(existingQuiz.description || '');
      setPassingScore(existingQuiz.passingScore || 70);
      setTimeLimit(existingQuiz.timeLimit || 30);
      setIsEditing(true);
      
      // Map questions to our format
      const formattedQuestions = existingQuiz.questions.map(q => ({
        id: q._id,
        text: q.text,
        options: q.options.map(opt => ({
          id: opt.id,
          text: opt.text
        })),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || ''
      }));
      
      setQuestions(formattedQuestions);
    } else {
      // Initialize with one empty question
      setQuestions([{
        id: uuidv4(),
        text: '',
        options: [
          { id: uuidv4(), text: '' },
          { id: uuidv4(), text: '' }
        ],
        correctAnswer: null,
        explanation: ''
      }]);
    }
  }, [existingQuiz]);
  
  // User must be a teacher or admin to create quizzes
  useEffect(() => {
    if (!loading && isAuthenticated && !(isTeacher || isAdmin)) {
      router.push('/lessons');
      announceToScreenReader('You do not have permission to create quizzes');
    }
  }, [isAuthenticated, isTeacher, isAdmin, router, loading]);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: uuidv4(),
      text: '',
      options: [
        { id: uuidv4(), text: '' },
        { id: uuidv4(), text: '' }
      ],
      correctAnswer: null,
      explanation: ''
    }]);
    
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
    
    announceToScreenReader('New question added');
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) return;
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
    announceToScreenReader('Question removed');
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ id: uuidv4(), text: '' });
    setQuestions(newQuestions);
    announceToScreenReader('Option added');
  };

  const removeOption = (qIndex, optIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length <= 2) return;
    
    // If removing the option that was set as correct answer, reset the correct answer
    const removedOption = newQuestions[qIndex].options[optIndex];
    if (newQuestions[qIndex].correctAnswer === removedOption.id) {
      newQuestions[qIndex].correctAnswer = null;
    }
    
    newQuestions[qIndex].options.splice(optIndex, 1);
    setQuestions(newQuestions);
    announceToScreenReader('Option removed');
  };
  
  const updateOption = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex].text = value;
    setQuestions(newQuestions);
  };

  const setCorrectAnswer = (qIndex, optionId) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = optionId;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!title.trim()) {
      setError('Quiz title is required');
      announceToScreenReader('Quiz title is required');
      return;
    }
    
    // Validate all questions have text, options and correct answer
    const hasInvalidQuestions = questions.some(q => 
      !q.text.trim() || 
      q.options.some(opt => !opt.text.trim()) ||
      q.correctAnswer === null
    );
    
    if (hasInvalidQuestions) {
      setError('Please fill in all question fields and select correct answers');
      announceToScreenReader('Some questions are incomplete. Please fill in all fields and select correct answers');
      return;
    }
    
    // Format questions for API
    const formattedQuestions = questions.map(q => ({
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation
    }));
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${existingQuiz._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/quizzes`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title,
          description,
          lessonId,
          questions: formattedQuestions,
          passingScore,
          timeLimit
        })
      });
      
      if (!response.ok) {
        throw new Error(isEditing ? 'Failed to update quiz' : 'Failed to create quiz');
      }
      
      const result = await response.json();
      
      announceToScreenReader(isEditing ? 'Quiz updated successfully' : 'Quiz created successfully');
      
      // Call the callback with the created/updated quiz data
      if (onQuizCreated) {
        onQuizCreated(result.data);
      }
      
    } catch (err) {
      console.error('Quiz creation error:', err);
      setError(err.message);
      announceToScreenReader(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
      </h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-md text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="quiz-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quiz Title <span className="text-red-500">*</span>
          </label>
          <input 
            id="quiz-title"
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
            placeholder="Enter quiz title"
          />
        </div>
        
        <div>
          <label htmlFor="quiz-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea 
            id="quiz-description"
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
            rows="3"
            placeholder="Enter quiz description (optional)"
          ></textarea>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="passing-score" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Passing Score (%)
            </label>
            <input 
              id="passing-score"
              type="number" 
              min="0"
              max="100"
              value={passingScore} 
              onChange={(e) => setPassingScore(parseInt(e.target.value, 10))} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
            />
          </div>
          
          <div>
            <label htmlFor="time-limit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Limit (minutes)
            </label>
            <input 
              id="time-limit"
              type="number" 
              min="1"
              value={timeLimit} 
              onChange={(e) => setTimeLimit(parseInt(e.target.value, 10))} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
            />
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Questions</h3>
          
          <div className="space-y-8">
            {questions.map((q, qIndex) => (
              <div key={q.id} className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-800 dark:text-white">Question {qIndex + 1}</h4>
                  <button 
                    type="button" 
                    onClick={() => removeQuestion(qIndex)}
                    disabled={questions.length <= 1}
                    className={`p-1 rounded-md ${
                      questions.length <= 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
                    }`}
                    aria-label="Remove question"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="mb-4">
                  <label htmlFor={`question-${qIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Question Text <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`question-${qIndex}`}
                    type="text"
                    value={q.text}
                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter question text"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Options <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Select the radio button next to the correct answer.
                  </p>
                  
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => (
                      <div key={opt.id} className="flex items-center">
                        <input
                          type="radio"
                          id={`q${qIndex}-opt${optIndex}`}
                          name={`correct-${qIndex}`}
                          checked={q.correctAnswer === opt.id}
                          onChange={() => setCorrectAnswer(qIndex, opt.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          aria-label={`Mark as correct answer`}
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          required
                          className="flex-1 ml-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button 
                          type="button" 
                          onClick={() => removeOption(qIndex, optIndex)}
                          disabled={q.options.length <= 2}
                          className={`ml-2 p-1 rounded-md ${
                            q.options.length <= 2
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
                          }`}
                          aria-label="Remove option"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:ring-blue-500 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add Option
                  </button>
                </div>
                
                <div>
                  <label htmlFor={`explanation-${qIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Explanation (Optional)
                  </label>
                  <textarea
                    id={`explanation-${qIndex}`}
                    value={q.explanation}
                    onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows="2"
                    placeholder="Add an explanation for the correct answer (shown after quiz submission)"
                  ></textarea>
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addQuestion}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:border-blue-300 focus:ring-blue-500 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Question
          </button>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => onQuizCreated && onQuizCreated(null)}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              <span>{isEditing ? 'Update Quiz' : 'Create Quiz'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizCreator;