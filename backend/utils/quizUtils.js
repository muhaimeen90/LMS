import mongoose from 'mongoose';
import logger from './logger.js';

/**
 * Calculate statistics for a quiz based on all attempts
 * @param {string} quizId - The quiz ID to calculate stats for
 * @returns {Promise<Object>} Quiz statistics
 */
export const calculateQuizStats = async (quizId) => {
  try {
    // Get the QuizAttempt model (assuming it's defined in quizModel.js)
    const QuizAttempt = mongoose.model('QuizAttempt');
    
    // Query all attempts for this quiz
    const attempts = await QuizAttempt.find({ quiz_id: quizId });
    
    if (!attempts || attempts.length === 0) {
      return {
        averageScore: 0,
        totalAttempts: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }

    const scores = attempts.map(attempt => (attempt.score / attempt.total_questions) * 100);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    return {
      averageScore: Math.round(averageScore * 100) / 100,
      totalAttempts: attempts.length,
      highestScore: Math.round(highestScore * 100) / 100,
      lowestScore: Math.round(lowestScore * 100) / 100
    };
  } catch (error) {
    logger.error(`Error calculating quiz stats: ${error.message}`);
    throw new Error(`Error calculating quiz stats: ${error.message}`);
  }
};

/**
 * Calculate statistics for a quiz based on given attempts
 * @param {Array} attempts - The quiz attempts
 * @returns {Object} Quiz statistics
 */
export const calculateStatsFromAttempts = (attempts) => {
  if (!attempts || attempts.length === 0) {
    return {
      averageScore: 0,
      totalAttempts: 0,
      highestScore: 0,
      lowestScore: 0,
      passRate: 0
    };
  }

  const scores = attempts.map(attempt => (attempt.score / attempt.total_questions) * 100);
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  
  // Calculate pass rate (assuming 70% is passing)
  const passCount = attempts.filter(attempt => 
    (attempt.score / attempt.total_questions) * 100 >= 70
  ).length;
  const passRate = (passCount / attempts.length) * 100;

  return {
    averageScore: Math.round(averageScore * 100) / 100,
    totalAttempts: attempts.length,
    highestScore: Math.round(highestScore * 100) / 100,
    lowestScore: Math.round(lowestScore * 100) / 100,
    passRate: Math.round(passRate * 100) / 100
  };
};

/**
 * Get quiz attempt history for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Quiz attempt history
 */
export const getUserQuizHistory = async (userId) => {
  try {
    // Get the QuizAttempt model
    const QuizAttempt = mongoose.model('QuizAttempt');
    
    // Use MongoDB aggregation to join quiz attempts with quiz information
    const attempts = await QuizAttempt.aggregate([
      { $match: { user_id: userId } },
      {
        $lookup: {
          from: 'quizzes', // The collection containing quiz documents
          localField: 'quiz_id',
          foreignField: 'id',
          as: 'quiz'
        }
      },
      { $unwind: '$quiz' },
      { $sort: { completed_at: -1 } }
    ]);

    return attempts;
  } catch (error) {
    logger.error(`Error fetching user quiz history: ${error.message}`);
    throw new Error(`Error fetching user quiz history: ${error.message}`);
  }
};

/**
 * Process quiz questions for creating or updating
 * @param {string} quizId - Quiz ID
 * @param {string} lessonId - Lesson ID
 * @param {Array} questions - Raw question data
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of question IDs
 */
export const processQuizQuestions = async (quizId, lessonId, questions, userId) => {
  // Get the QuizQuestion model
  const QuizQuestion = mongoose.model('QuizQuestion');
  
  // Process each question
  const questionPromises = questions.map(async (question) => {
    const questionData = {
      quiz_id: quizId,
      lesson_id: lessonId,
      question: question.text,
      options: question.options.map((text, idx) => ({ 
        id: `option_${idx}`, 
        text 
      })),
      correctOptionId: `option_${question.options.indexOf(question.correct_answer)}`,
      created_by: userId || 'anonymous'
    };

    // Add explanation if available
    if (question.explanation) {
      questionData.explanation = question.explanation;
    }
    
    // Add difficulty if available
    if (question.difficulty) {
      questionData.difficulty = question.difficulty;
    }

    // Create and save the question
    const savedQuestion = await QuizQuestion.create(questionData);
    return savedQuestion._id;
  });

  // Wait for all questions to be created
  return Promise.all(questionPromises);
};

/**
 * Validate quiz submission answers against questions
 * @param {Array} questions - Array of quiz questions
 * @param {Array} answers - Array of user answers
 * @returns {boolean} True if validation passes
 * @throws {Error} If validation fails
 */
export const validateQuizSubmission = (questions, answers) => {
  // Validate that all questions are answered
  const answeredQuestionIds = answers.map(a => a.questionId);
  const unansweredQuestions = questions.filter(q => !answeredQuestionIds.includes(q.id));

  if (unansweredQuestions.length > 0) {
    throw new Error('All questions must be answered');
  }

  // Validate that answers are in correct format
  const invalidAnswers = answers.filter(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    return !question || typeof answer.selectedAnswer !== 'string';
  });

  if (invalidAnswers.length > 0) {
    throw new Error('Invalid answer format');
  }

  return true;
};

/**
 * Verify quiz answers and calculate score
 * @param {Array} questions - Array of quiz questions
 * @param {Array} answers - Array of user answers
 * @returns {Object} Verification result with score and processed answers
 */
export const verifyQuizAnswers = (questions, answers) => {
  let correctAnswers = 0;
  const processedAnswers = [];
  
  // Process each answer
  answers.forEach(answer => {
    const question = questions.find(q => q._id.toString() === answer.questionId);
    
    if (question) {
      const isCorrect = answer.selectedAnswer === question.correctOptionId;
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      processedAnswers.push({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      });
    }
  });
  
  const totalQuestions = questions.length;
  const percentage = (correctAnswers / totalQuestions) * 100;
  
  return {
    score: correctAnswers,
    totalQuestions,
    percentage: Math.round(percentage * 100) / 100,
    passed: percentage >= 70, // Default passing percentage
    answers: processedAnswers
  };
};

/**
 * Format quiz data for API response
 * @param {Object} quiz - Quiz document
 * @param {boolean} includeCorrectAnswers - Whether to include correct answers
 * @returns {Object} Formatted quiz data
 */
export const formatQuizForResponse = (quiz, includeCorrectAnswers = false) => {
  const formattedQuiz = {
    id: quiz._id,
    title: quiz.title,
    description: quiz.description,
    lesson_id: quiz.lesson_id,
    created_by: quiz.created_by,
    created_at: quiz.created_at,
    updated_at: quiz.updated_at,
    questions: quiz.questions.map(q => ({
      id: q._id,
      question: q.question,
      options: q.options,
      ...(includeCorrectAnswers && { correctOptionId: q.correctOptionId }),
      ...(q.explanation && { explanation: q.explanation }),
      ...(q.difficulty && { difficulty: q.difficulty })
    }))
  };
  
  return formattedQuiz;
};