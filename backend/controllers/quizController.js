import { Quiz, QuizQuestion, QuizAttempt } from '../models/quizModel.js';
import ApiError from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get all quizzes (public)
const getAllQuizzes = asyncHandler(async (req, res) => {
  const { title, sort, page = 1, limit = 20 } = req.query;
  
  // Prepare filter options
  const filter = { isActive: true };
  if (title) {
    filter.title = { $regex: title, $options: 'i' };
  }

  // Prepare sort options
  const sortOptions = {};
  if (sort) {
    const [field, order] = sort.split(':');
    sortOptions[field] = order === 'desc' ? -1 : 1;
  } else {
    sortOptions.createdAt = -1; // Default sort by newest
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Execute query
  const quizzes = await Quiz.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('questions', '-correctAnswer') // Exclude correct answers
    .populate('createdBy', 'username email');
  
  const total = await Quiz.countDocuments(filter);

  return res
    .status(200)
    .json(new ApiResponse(
      200, 
      { 
        data: quizzes,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      'Quizzes retrieved successfully'
    ));
});

// Get quiz by ID (public)
const getQuizById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const quiz = await Quiz.findOne({ _id: id, isActive: true })
    .populate('questions')
    .populate('createdBy', 'username email');
  
  if (!quiz) {
    throw new ApiError(404, 'Quiz not found');
  }
  
  return res
    .status(200)
    .json(new ApiResponse(200, quiz, 'Quiz retrieved successfully'));
});

// Teacher creates a new quiz
const createQuiz = asyncHandler(async (req, res) => {
  const { title, description, lessonId, questions, passingScore, timeLimit } = req.body;
  const userId = req.user._id;

  if (!title || !lessonId || !questions || questions.length === 0) {
    throw new ApiError(400, 'Title, lesson ID, and at least one question are required');
  }

  // Create quiz first
  const quiz = await Quiz.create({
    title,
    description,
    lessonId,
    passingScore,
    timeLimit,
    createdBy: userId
  });

  // Create questions and link to quiz
  const createdQuestions = await Promise.all(
    questions.map(async (q) => {
      const question = await QuizQuestion.create({
        quizId: quiz._id,
        lessonId,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty || 'medium',
        createdBy: userId
      });
      return question._id;
    })
  );

  // Update quiz with question references
  quiz.questions = createdQuestions;
  await quiz.save();

  // Populate the quiz with questions for response
  const populatedQuiz = await Quiz.findById(quiz._id).populate('questions');

  return res
    .status(201)
    .json(new ApiResponse(201, populatedQuiz, 'Quiz created successfully'));
});

// Get quiz by lesson ID
const getQuizByLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  const quiz = await Quiz.findOne({ lessonId, isActive: true })
    .populate('questions')
    .populate('createdBy', 'username email');

  if (!quiz) {
    throw new ApiError(404, 'No quiz found for this lesson');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, quiz, 'Quiz retrieved successfully'));
});

// Student submits quiz attempt
const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { quizId, lessonId, answers, timeTaken } = req.body;
  const userId = req.user._id;

  // Validate inputs
  if (!quizId || !lessonId || !answers || !Array.isArray(answers)) {
    throw new ApiError(400, 'Quiz ID, lesson ID, and answers are required');
  }

  // Get the quiz with questions
  const quiz = await Quiz.findById(quizId).populate('questions');
  if (!quiz) {
    throw new ApiError(404, 'Quiz not found');
  }

  // Verify answers and calculate score
  let correctCount = 0;
  const processedAnswers = await Promise.all(
    answers.map(async (answer) => {
      const question = quiz.questions.find(
        (q) => q._id.toString() === answer.questionId
      );
      
      if (!question) {
        throw new ApiError(400, `Question ${answer.questionId} not found in this quiz`);
      }

      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) correctCount++;

      return {
        questionId: question._id,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      };
    })
  );

  // Calculate results
  const totalQuestions = quiz.questions.length;
  const score = correctCount;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = percentage >= quiz.passingScore;

  // Save attempt
  const attempt = await QuizAttempt.create({
    quizId,
    userId,
    lessonId,
    answers: processedAnswers,
    score,
    percentage,
    passed,
    timeTaken
  });

  return res
    .status(201)
    .json(new ApiResponse(201, attempt, 'Quiz attempt submitted successfully'));
});

// Get quiz attempts for a student
const getStudentAttempts = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user._id;

  const attempts = await QuizAttempt.find({ 
    userId, 
    lessonId 
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, attempts, 'Quiz attempts retrieved successfully'));
});

// Get quiz statistics for a student
const getStudentQuizStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = await QuizAttempt.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: "$percentage" },
        highestScore: { $max: "$percentage" },
        passedCount: {
          $sum: {
            $cond: [{ $eq: ["$passed", true] }, 1, 0]
          }
        },
        totalQuizzes: { $addToSet: "$quizId" }
      }
    },
    {
      $project: {
        _id: 0,
        totalAttempts: 1,
        averageScore: { $round: ["$averageScore", 2] },
        highestScore: 1,
        passedCount: 1,
        totalQuizzes: { $size: "$totalQuizzes" }
      }
    }
  ]);

  const result = stats[0] || {
    totalAttempts: 0,
    averageScore: 0,
    highestScore: 0,
    passedCount: 0,
    totalQuizzes: 0
  };

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Quiz statistics retrieved successfully'));
});

export {
  createQuiz,
  getQuizByLesson,
  submitQuizAttempt,
  getStudentAttempts,
  getStudentQuizStats,
  getAllQuizzes,
  getQuizById
};