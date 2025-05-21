import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// Define Quiz Question Schema (for storing questions and answers)
const quizQuestionSchema = new mongoose.Schema({
  quiz_id: {
    type: String,
    required: true,
    index: true
  },
  lesson_id: {
    type: String,
    required: true,
    index: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    id: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    }
  }],
  correctOptionId: {
    type: String,
    required: true
  },
  explanation: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  tags: [{
    type: String
  }],
  created_by: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
});

// Define Quiz Schema (for grouping questions)
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  lesson_id: {
    type: String,
    required: true,
    index: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizQuestion'
  }],
  created_by: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  time_limit: {
    type: Number,  // Time limit in seconds
    default: null  // null means no time limit
  },
  passing_percentage: {
    type: Number,
    default: 70  // Default passing score is 70%
  },
  attempts_allowed: {
    type: Number,
    default: null  // null means unlimited attempts
  },
  settings: {
    randomize_questions: {
      type: Boolean,
      default: false
    },
    show_correct_answers: {
      type: Boolean,
      default: true
    },
    show_explanation: {
      type: Boolean,
      default: true
    }
  }
});

// Define Quiz Attempt Schema (for tracking user submissions)
const quizAttemptSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  quiz_id: {
    type: String,
    required: true,
    index: true
  },
  lesson_id: {
    type: String,
    required: true,
    index: true
  },
  attempt_number: {
    type: Number,
    required: true,
    default: 1
  },
  score: {
    type: Number,
    required: true
  },
  total_questions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    get: function() {
      return (this.score / this.total_questions) * 100;
    }
  },
  answers: [{
    questionId: {
      type: String,
      required: true
    },
    selectedAnswer: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean
    }
  }],
  completed_at: {
    type: Date,
    default: Date.now
  },
  time_taken: {
    type: Number
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Index for faster queries on user quiz attempts
quizAttemptSchema.index({ user_id: 1, quiz_id: 1, attempt_number: 1 });

// Create models
const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);
const Quiz = mongoose.model('Quiz', quizSchema);
const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

/**
 * Create a new quiz question
 * @param {Object} questionData - Question data
 * @returns {Promise<Object>} Created question
 */
export const createQuizQuestion = async (questionData) => {
  try {
    const quizQuestion = new QuizQuestion(questionData);
    return await quizQuestion.save();
  } catch (error) {
    logger.error(`Error creating quiz question: ${error.message}`);
    throw error;
  }
};

/**
 * Update an existing quiz question
 * @param {string} questionId - Question ID
 * @param {Object} questionData - Updated question data
 * @returns {Promise<Object>} Updated question
 */
export const updateQuizQuestion = async (questionId, questionData) => {
  try {
    questionData.updated_at = new Date();
    return await QuizQuestion.findByIdAndUpdate(
      questionId,
      questionData,
      { new: true }
    );
  } catch (error) {
    logger.error(`Error updating quiz question: ${error.message}`);
    throw error;
  }
};

/**
 * Get a quiz question by ID
 * @param {string} questionId - Question ID
 * @returns {Promise<Object>} Quiz question
 */
export const getQuizQuestionById = async (questionId) => {
  try {
    return await QuizQuestion.findById(questionId);
  } catch (error) {
    logger.error(`Error getting quiz question: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a quiz question
 * @param {string} questionId - Question ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteQuizQuestion = async (questionId) => {
  try {
    return await QuizQuestion.findByIdAndDelete(questionId);
  } catch (error) {
    logger.error(`Error deleting quiz question: ${error.message}`);
    throw error;
  }
};

/**
 * Get all questions for a quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Array>} Array of questions
 */
export const getQuizQuestions = async (quizId) => {
  try {
    return await QuizQuestion.find({ 
      quiz_id: quizId,
      active: true
    });
  } catch (error) {
    logger.error(`Error getting quiz questions: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new quiz
 * @param {Object} quizData - Quiz data
 * @returns {Promise<Object>} Created quiz
 */
export const createQuiz = async (quizData) => {
  try {
    const quiz = new Quiz(quizData);
    return await quiz.save();
  } catch (error) {
    logger.error(`Error creating quiz: ${error.message}`);
    throw error;
  }
};

/**
 * Get a quiz by ID
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Object>} Quiz
 */
export const getQuizById = async (quizId) => {
  try {
    return await Quiz.findById(quizId)
      .populate('questions');
  } catch (error) {
    logger.error(`Error getting quiz: ${error.message}`);
    throw error;
  }
};

/**
 * Get a quiz by lesson ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Quiz
 */
export const getQuizByLessonId = async (lessonId) => {
  try {
    return await Quiz.findOne({ 
      lesson_id: lessonId,
      active: true
    })
    .populate('questions');
  } catch (error) {
    logger.error(`Error getting quiz by lesson ID: ${error.message}`);
    throw error;
  }
};

/**
 * Update an existing quiz
 * @param {string} quizId - Quiz ID
 * @param {Object} quizData - Updated quiz data
 * @returns {Promise<Object>} Updated quiz
 */
export const updateQuiz = async (quizId, quizData) => {
  try {
    quizData.updated_at = new Date();
    return await Quiz.findByIdAndUpdate(
      quizId,
      quizData,
      { new: true }
    );
  } catch (error) {
    logger.error(`Error updating quiz: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteQuiz = async (quizId) => {
  try {
    return await Quiz.findByIdAndUpdate(
      quizId,
      { active: false, updated_at: new Date() },
      { new: true }
    );
  } catch (error) {
    logger.error(`Error deleting quiz: ${error.message}`);
    throw error;
  }
};

/**
 * Add a question to a quiz
 * @param {string} quizId - Quiz ID
 * @param {string} questionId - Question ID
 * @returns {Promise<Object>} Updated quiz
 */
export const addQuestionToQuiz = async (quizId, questionId) => {
  try {
    return await Quiz.findByIdAndUpdate(
      quizId,
      { 
        $push: { questions: questionId },
        updated_at: new Date()
      },
      { new: true }
    );
  } catch (error) {
    logger.error(`Error adding question to quiz: ${error.message}`);
    throw error;
  }
};

/**
 * Remove a question from a quiz
 * @param {string} quizId - Quiz ID
 * @param {string} questionId - Question ID
 * @returns {Promise<Object>} Updated quiz
 */
export const removeQuestionFromQuiz = async (quizId, questionId) => {
  try {
    return await Quiz.findByIdAndUpdate(
      quizId,
      { 
        $pull: { questions: questionId },
        updated_at: new Date()
      },
      { new: true }
    );
  } catch (error) {
    logger.error(`Error removing question from quiz: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new quiz result
 * @param {Object} quizResultData - Quiz result data
 * @returns {Promise<Object>} Created quiz result
 */
export const createQuizResult = async (quizResultData) => {
  try {
    if (!quizResultData.time_taken) {
      quizResultData.time_taken = 0; // Default time taken
    }

    // Calculate percentage and mark correct/incorrect answers
    quizResultData.percentage = (quizResultData.score / quizResultData.total_questions) * 100;

    // Create and save the quiz attempt
    const quizAttempt = new QuizAttempt(quizResultData);
    return await quizAttempt.save();
  } catch (error) {
    logger.error(`Error creating quiz result: ${error.message}`);
    throw error;
  }
};

/**
 * Get the latest quiz attempt for a user
 * @param {string} userId - User ID
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Object|null>} Latest quiz attempt or null if none found
 */
export const getLatestQuizAttempt = async (userId, quizId) => {
  try {
    return await QuizAttempt.findOne({ 
      user_id: userId, 
      quiz_id: quizId 
    })
    .sort({ attempt_number: -1 })
    .limit(1);
  } catch (error) {
    logger.error(`Error getting latest quiz attempt: ${error.message}`);
    throw error;
  }
};

/**
 * Get all quiz attempts for a user and quiz
 * @param {string} userId - User ID
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Array>} Array of quiz attempts
 */
export const getUserQuizAttempts = async (userId, quizId) => {
  try {
    return await QuizAttempt.find({ 
      user_id: userId, 
      quiz_id: quizId 
    })
    .sort({ attempt_number: 1 });
  } catch (error) {
    logger.error(`Error getting user quiz attempts: ${error.message}`);
    throw error;
  }
};

/**
 * Get all quiz results for a user across all quizzes
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of quiz results
 */
export const getAllUserQuizResults = async (userId) => {
  try {
    return await QuizAttempt.find({ user_id: userId })
      .sort({ completed_at: -1 });
  } catch (error) {
    logger.error(`Error getting all user quiz results: ${error.message}`);
    throw error;
  }
};

/**
 * Get statistics for a user across all quizzes
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Quiz statistics
 */
export const getUserQuizStatistics = async (userId) => {
  try {
    const attempts = await QuizAttempt.find({ user_id: userId });
    
    if (attempts.length === 0) {
      return {
        total_quizzes_attempted: 0,
        total_attempts: 0,
        average_score: 0,
        highest_score: 0,
        quizzes_passed: 0,
        pass_rate: 0
      };
    }

    // Get unique quizzes attempted
    const uniqueQuizIds = [...new Set(attempts.map(a => a.quiz_id))];
    
    // Calculate statistics
    const totalAttempts = attempts.length;
    const totalScore = attempts.reduce((sum, a) => sum + a.percentage, 0);
    const averageScore = totalScore / totalAttempts;
    const highestScore = Math.max(...attempts.map(a => a.percentage));
    
    // Consider a score of 70% or higher as passing
    const quizzesPassed = attempts.filter(a => a.percentage >= 70).length;
    const passRate = (quizzesPassed / totalAttempts) * 100;
    
    // Get best attempt for each quiz
    const bestAttempts = [];
    for (const quizId of uniqueQuizIds) {
      const quizAttempts = attempts.filter(a => a.quiz_id === quizId);
      const bestAttempt = quizAttempts.reduce((best, current) => 
        current.percentage > best.percentage ? current : best, quizAttempts[0]);
      bestAttempts.push(bestAttempt);
    }
    
    return {
      total_quizzes_attempted: uniqueQuizIds.length,
      total_attempts: totalAttempts,
      average_score: averageScore,
      highest_score: highestScore,
      quizzes_passed: quizzesPassed,
      pass_rate: passRate,
      best_attempts: bestAttempts
    };
  } catch (error) {
    logger.error(`Error getting user quiz statistics: ${error.message}`);
    throw error;
  }
};

/**
 * Verify a user's quiz answers against correct answers
 * @param {string} quizId - Quiz ID
 * @param {Array} userAnswers - Array of user answers with question IDs and selected answers
 * @returns {Promise<Object>} Verification result with score
 */
export const verifyQuizAnswers = async (quizId, userAnswers) => {
  try {
    // Get questions for this quiz
    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    const questions = quiz.questions;
    let correctAnswers = 0;
    
    // Process each user answer
    const processedAnswers = userAnswers.map(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      
      if (!question) {
        return {
          ...answer,
          isCorrect: false,
          error: 'Question not found'
        };
      }
      
      const isCorrect = question.correctOptionId === answer.selectedAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      return {
        ...answer,
        isCorrect
      };
    });
    
    const score = correctAnswers;
    const totalQuestions = questions.length;
    const percentage = (score / totalQuestions) * 100;
    
    return {
      score,
      totalQuestions,
      percentage,
      passing_percentage: quiz.passing_percentage,
      passed: percentage >= quiz.passing_percentage,
      answers: processedAnswers
    };
  } catch (error) {
    logger.error(`Error verifying quiz answers: ${error.message}`);
    throw error;
  }
};

export { Quiz, QuizQuestion, QuizAttempt };
export default QuizAttempt;