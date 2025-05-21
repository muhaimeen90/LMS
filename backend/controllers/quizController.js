import { ApiError, catchAsync } from '../utils/errorHandler.js';
import { 
  validateQuizSubmission, 
  verifyQuizAnswers, 
  processQuizQuestions,
  formatQuizForResponse
} from '../utils/quizUtils.js';
import {
  createQuizResult,
  getLatestQuizAttempt,
  getUserQuizAttempts,
  getAllUserQuizResults,
  getUserQuizStatistics
} from '../models/quizModel.js';
import { Quiz, QuizQuestion, QuizAttempt } from '../models/quizModel.js';
import { getLessonById } from '../models/lessonModel.js';

export const getAllQuizzes = catchAsync(async (req, res) => {
  const quizzes = await Quiz.find().sort({ created_at: -1 });
  
  res.status(200).json({
    status: 'success',
    results: quizzes.length,
    data: quizzes
  });
});

export const getQuizById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const quiz = await Quiz.findById(id).populate('questions');

  if (!quiz) {
    throw new ApiError(404, 'Quiz not found');
  }

  // Format the quiz data using our utility
  const formattedQuiz = formatQuizForResponse(quiz);

  res.status(200).json({
    status: 'success',
    data: formattedQuiz
  });
});

export const createQuiz = catchAsync(async (req, res) => {
  const { title, description, lessonId, questions } = req.body;

  if (!title || !lessonId || !questions || questions.length === 0) {
    throw new ApiError(400, 'Please provide all required fields (title, lessonId, and questions)');
  }

  // Check if the lesson exists
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  // Prepare quiz data
  const quizData = {
    title,
    description: description || '',
    lesson_id: lessonId,
    created_by: req.user?.userId || 'anonymous',
    questions: []
  };

  // Create and save the quiz
  const savedQuiz = await Quiz.create(quizData);

  // Process questions using the central utility
  const questionIds = await processQuizQuestions(
    savedQuiz._id, 
    lessonId, 
    questions, 
    req.user?.userId || 'anonymous'
  );

  // Update quiz with question IDs
  savedQuiz.questions = questionIds;
  await savedQuiz.save();

  // Fetch the complete quiz with populated questions
  const completeQuiz = await Quiz.findById(savedQuiz._id).populate('questions');

  res.status(201).json({
    status: 'success',
    data: formatQuizForResponse(completeQuiz)
  });
});

export const updateQuiz = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, questions } = req.body;

  // Get existing quiz
  const existingQuiz = await Quiz.findById(id).populate('questions');
  if (!existingQuiz) {
    throw new ApiError(404, 'Quiz not found');
  }

  // Update basic quiz information
  if (title) existingQuiz.title = title;
  if (description !== undefined) existingQuiz.description = description;
  existingQuiz.updated_at = new Date();
  
  // Save the updated quiz
  await existingQuiz.save();
  
  // If questions are provided, update them
  if (questions && Array.isArray(questions)) {
    // Delete existing questions
    await QuizQuestion.deleteMany({ quiz_id: existingQuiz._id });
    
    // Process questions using the central utility
    const questionIds = await processQuizQuestions(
      existingQuiz._id,
      existingQuiz.lesson_id,
      questions,
      req.user?.userId || existingQuiz.created_by
    );
    
    // Update quiz with new question IDs
    existingQuiz.questions = questionIds;
    await existingQuiz.save();
  }

  // Get the updated quiz with populated questions
  const updatedQuiz = await Quiz.findById(id).populate('questions');

  res.status(200).json({
    status: 'success',
    data: formatQuizForResponse(updatedQuiz)
  });
});

export const deleteQuiz = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Get existing quiz
  const existingQuiz = await Quiz.findById(id);
  if (!existingQuiz) {
    throw new ApiError(404, 'Quiz not found');
  }

  // Delete the quiz questions
  await QuizQuestion.deleteMany({ quiz_id: id });
  
  // Delete the quiz
  await Quiz.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    message: 'Quiz deleted successfully'
  });
});

export const getQuizStats = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // Check if quiz exists
  const quiz = await Quiz.findById(id);
  if (!quiz) {
    throw new ApiError(404, 'Quiz not found');
  }
  
  // Get all attempts for this quiz
  const attempts = await QuizAttempt.find({ quiz_id: id });
  
  // Calculate statistics
  const stats = calculateQuizStats(attempts);
  
  res.status(200).json({
    status: 'success',
    data: stats
  });
});

export const submitQuizAttempt = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;
  const userId = req.user?.userId || 'anonymous';

  if (!answers || !Array.isArray(answers)) {
    throw new ApiError(400, 'Please provide answers in the correct format');
  }

  // Get quiz with questions
  const quiz = await Quiz.findById(id).populate('questions');
  if (!quiz) {
    throw new ApiError(404, 'Quiz not found');
  }

  const questions = quiz.questions;
  if (!questions || questions.length === 0) {
    throw new ApiError(404, 'Quiz questions not found');
  }

  // Verify answers against correct answers using our central utility
  const verificationResult = verifyQuizAnswers(questions, answers);
  
  // Get attempt number
  const lastAttempt = await getLatestQuizAttempt(userId, id);
  const attemptNumber = lastAttempt ? lastAttempt.attempt_number + 1 : 1;

  // Save attempt
  const attemptData = await createQuizResult({
    user_id: userId,
    lesson_id: quiz.lesson_id,
    quiz_id: id,
    score: verificationResult.score,
    total_questions: verificationResult.totalQuestions,
    attempt_number: attemptNumber,
    answers: verificationResult.answers,
    time_taken: req.body.timeTaken || 0
  });

  res.status(201).json({
    status: 'success',
    data: {
      ...verificationResult,
      attemptId: attemptData._id,
      attemptNumber
    }
  });
});

// Additional function to handle quiz by lesson ID
export const getQuizByLesson = catchAsync(async (req, res) => {
  const { lessonId } = req.params;
  
  const quiz = await Quiz.findOne({ lesson_id: lessonId }).populate('questions');
  
  if (!quiz) {
    return res.status(404).json({
      status: 'fail',
      message: 'No quiz found for this lesson'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: formatQuizForResponse(quiz)
  });
});

// Get quiz attempts for a user
export const getUserAttempts = catchAsync(async (req, res) => {
  const { userId, quizId } = req.params;
  
  const attempts = await getUserQuizAttempts(userId, quizId);
  
  res.status(200).json({
    status: 'success',
    results: attempts.length,
    data: attempts
  });
});