'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const QuizCreator = ({ lessonId, onQuizCreated, existingQuiz = null }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Initialize state with existing quiz if provided, otherwise start with one empty question
  const [quizTitle, setQuizTitle] = useState(existingQuiz?.title || `Quiz for Lesson ${lessonId}`);
  const [quizDescription, setQuizDescription] = useState(existingQuiz?.description || '');
  const [questions, setQuestions] = useState(
    existingQuiz?.questions?.map(q => ({
      question: q.text,
      options: q.options.map((opt, idx) => ({
        id: `option${idx + 1}`,
        text: opt
      })),
      correctOptionId: `option${q.options.indexOf(q.correctAnswer) + 1}`,
      explanation: q.explanation || ''
    })) || [
      {
        question: '',
        options: [
          { id: 'option1', text: '' },
          { id: 'option2', text: '' }
        ],
        correctOptionId: 'option1',
        explanation: ''
      }
    ]
  );

  // Add a new question
  const addQuestion = () => {
    const newOptionId1 = `option1_${Date.now()}`;
    const newOptionId2 = `option2_${Date.now()}`;
    
    setQuestions([
      ...questions,
      {
        question: '',
        options: [
          { id: newOptionId1, text: '' },
          { id: newOptionId2, text: '' }
        ],
        correctOptionId: newOptionId1,
        explanation: ''
      }
    ]);
  };

  // Remove a question
  const removeQuestion = (index) => {
    if (questions.length === 1) {
      setError('Quiz must have at least one question');
      return;
    }
    
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
    setError('');
  };

  // Update question text
  const updateQuestion = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  // Add an option to a question
  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    const newOptionId = `option${updatedQuestions[questionIndex].options.length + 1}_${Date.now()}`;
    
    updatedQuestions[questionIndex].options.push({
      id: newOptionId,
      text: ''
    });
    
    setQuestions(updatedQuestions);
  };

  // Remove an option
  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    
    // Ensure at least two options remain
    if (updatedQuestions[questionIndex].options.length <= 2) {
      setError('Questions must have at least two options');
      return;
    }
    
    // If removing the correct option, set a new one
    const removedOptionId = updatedQuestions[questionIndex].options[optionIndex].id;
    if (removedOptionId === updatedQuestions[questionIndex].correctOptionId) {
      // Find the first option that's not being removed
      const newCorrectOption = updatedQuestions[questionIndex].options.find(
        (opt, idx) => idx !== optionIndex
      );
      updatedQuestions[questionIndex].correctOptionId = newCorrectOption.id;
    }
    
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
    setError('');
  };

  // Update option text
  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex].text = value;
    setQuestions(updatedQuestions);
  };

  // Set correct answer
  const setCorrectOption = (questionIndex, optionId) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctOptionId = optionId;
    setQuestions(updatedQuestions);
  };

  // Update explanation
  const updateExplanation = (questionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].explanation = value;
    setQuestions(updatedQuestions);
  };

  // Validate the quiz
  const validateQuiz = () => {
    // Check quiz title
    if (!quizTitle.trim()) {
      setError('Quiz title is required');
      return false;
    }
    
    // Check if any questions are empty
    const emptyQuestion = questions.find(q => !q.question.trim());
    if (emptyQuestion) {
      setError('All questions must have content');
      return false;
    }
    
    // Check options
    for (let i = 0; i < questions.length; i++) {
      // Check if any options are empty
      const emptyOption = questions[i].options.find(opt => !opt.text.trim());
      if (emptyOption) {
        setError(`Question ${i + 1} has empty options`);
        return false;
      }
      
      // Validate correct option is set
      const hasCorrect = questions[i].options.some(opt => opt.id === questions[i].correctOptionId);
      if (!hasCorrect) {
        setError(`Question ${i + 1} doesn't have a correct answer selected`);
        return false;
      }
    }
    
    return true;
  };

  // Submit the quiz
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccess(false);
    
    // Validate quiz
    if (!validateQuiz()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Transform data to match backend expectations
      const transformedQuestions = questions.map(q => ({
        text: q.question,
        options: q.options.map(opt => opt.text),
        correctAnswer: q.options.find(opt => opt.id === q.correctOptionId)?.text || '',
        explanation: q.explanation
      }));
      
      const quizData = {
        title: quizTitle,
        description: quizDescription,
        lessonId,
        questions: transformedQuestions
      };
      
      // Use PATCH if updating existing quiz, POST if creating new one
      const method = existingQuiz ? 'PATCH' : 'POST';
      const url = existingQuiz 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${existingQuiz.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/quizzes`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save quiz');
      }
      
      const data = await response.json();
      
      setSuccess(true);
      
      // Callback with the created/updated quiz
      if (onQuizCreated) {
        onQuizCreated(data.data);
      }
      
      // Refresh lesson page after a delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Quiz creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {existingQuiz ? 'Edit Quiz' : 'Create Quiz'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Add questions and options for this lesson's quiz.
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}
      
      {/* Success message */}
      {success && (
        <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
          Quiz successfully {existingQuiz ? 'updated' : 'created'}!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-8">
          {/* Quiz Title */}
          <div className="mb-4">
            <label 
              htmlFor="quiz-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Quiz Title *
            </label>
            <input
              id="quiz-title"
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
              placeholder="Enter quiz title"
            />
          </div>

          {/* Quiz Description */}
          <div className="mb-4">
            <label 
              htmlFor="quiz-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="quiz-description"
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows={2}
              placeholder="Enter quiz description (optional)"
            />
          </div>

          {/* Questions */}
          {questions.map((questionObj, qIndex) => (
            <div 
              key={qIndex} 
              className="pb-6 border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-800 dark:text-white">
                  Question {qIndex + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  aria-label={`Remove question ${qIndex + 1}`}
                >
                  Remove
                </button>
              </div>
              
              {/* Question text */}
              <div className="mb-4">
                <label 
                  htmlFor={`question-${qIndex}`}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Question *
                </label>
                <textarea
                  id={`question-${qIndex}`}
                  value={questionObj.question}
                  onChange={(e) => updateQuestion(qIndex, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  rows={2}
                  required
                  placeholder="Enter question text"
                />
              </div>
              
              {/* Options */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Answer Options *
                </label>
                
                <div className="space-y-3">
                  {questionObj.options.map((option, optIndex) => (
                    <div key={option.id} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id={`correct-${qIndex}-${optIndex}`}
                        name={`correct-${qIndex}`}
                        checked={option.id === questionObj.correctOptionId}
                        onChange={() => setCorrectOption(qIndex, option.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder={`Option ${optIndex + 1}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, optIndex)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        aria-label={`Remove option ${optIndex + 1}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Option
                </button>
              </div>
              
              {/* Explanation (optional) */}
              <div>
                <label 
                  htmlFor={`explanation-${qIndex}`}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Explanation (Optional)
                </label>
                <textarea
                  id={`explanation-${qIndex}`}
                  value={questionObj.explanation}
                  onChange={(e) => updateExplanation(qIndex, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  rows={2}
                  placeholder="Explain why the correct answer is right (shown after quiz completion)"
                />
              </div>
            </div>
          ))}
          
          {/* Add question button */}
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Question
          </button>
        </div>
        
        {/* Form actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>Save Quiz</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizCreator;