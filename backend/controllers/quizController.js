import { Quiz, QuizQuestion, QuizAttempt } from '../models/quizModel.js';
import ApiError from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { awardXP } from '../utils/xpUtils.js';

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
  
  try {
    // Execute query with proper error handling
    const quizzes = await Quiz.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('questions', '-correctAnswer');
    
    // Don't try to populate createdBy since it might be a string ID 
    // instead of a MongoDB ObjectId reference

    const total = await Quiz.countDocuments(filter);
    console.log('Total quizzes found:', total);

    return res.status(200).json(new ApiResponse(
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
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw new ApiError(500, 'Failed to retrieve quizzes due to server error');
  }
});

// Get quiz by ID (public)
const getQuizById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    // Find quiz by MongoDB ID and populate questions
    const quiz = await Quiz.findOne({ _id: id, isActive: true })
      .populate('questions');
    
    // Don't try to populate createdBy with specific fields since they might not exist
    
    if (!quiz) {
      throw new ApiError(404, 'Quiz not found');
      
    }
    
    return res
      .status(200)
      .json(new ApiResponse(200, quiz, 'Quiz retrieved successfully'));
  } catch (error) {
    console.error('Error fetching quiz by ID:', error);
    throw new ApiError(500, `Failed to retrieve quiz: ${error.message}`);
  }
});

// Teacher creates a new quiz
const createQuiz = asyncHandler(async (req, res) => {
  const { title, description, lessonId, questions, passingScore, timeLimit } = req.body;
  // Get the user ID from the authenticated user
  const userId = req.user?.id || req.user?._id;
  
  if (!userId) {
    throw new ApiError(401, 'Authentication required to create a quiz');
  }

  if (!title || !lessonId || !questions || questions.length === 0) {
    throw new ApiError(400, 'Title, lesson ID, and at least one question are required');
  }

  try {
    // Create quiz first with generated ID
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
  } catch (error) {
    throw new ApiError(500, error.message || 'Failed to create quiz');
  }
});

// Get quiz by lesson ID
const getQuizByLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  // Log the incoming lessonId for debugging
  console.log('Fetching quiz for lessonId:', lessonId);
  
  try {
    // Create a proper query without any potential MongoDB errors
    const query = { lessonId };
    
    console.log('MongoDB query:', JSON.stringify(query));
    
    // Attempt to find the quiz with exact lessonId
    let quiz = await Quiz.findOne(query)
      .populate('questions');
    
    // Debug log to see if quiz was found
    console.log('Quiz found:', quiz ? 'yes' : 'no');

    if (!quiz) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, 'No quiz found for this lesson'));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, quiz, 'Quiz retrieved successfully'));
  } catch (error) {
    console.error(`Error fetching quiz for lesson ${lessonId}:`, error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, `Error fetching quiz: ${error.message}`));
  }
});

// Student submits quiz attempt
const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { quizId, lessonId, answers, timeTaken } = req.body;
  
  // Get user ID from auth user object with flexible format
  const userId = req.user?.id || req.user?._id || req.user;
  
  // Debug info for troubleshooting
  console.log('Quiz submission - User object:', req.user);
  console.log('Quiz submission - Answers:', answers);
  
  // Validate required inputs
  if (!quizId || !lessonId || !answers || !Array.isArray(answers)) {
    throw new ApiError(400, 'Quiz ID, lesson ID, and answers are required');
  }
  
  if (!userId) {
    throw new ApiError(401, 'User authentication required to submit quiz');
  }

  try {
    // Get the quiz with questions
    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) {
      throw new ApiError(404, 'Quiz not found');
    }

    // Verify answers and calculate score
    let correctCount = 0;
    
    // Process answers and ensure selectedAnswer is never empty
    const processedAnswers = answers.map(answer => {
      // Ensure we have a valid selectedAnswer
      if (!answer.selectedAnswer || answer.selectedAnswer === '') {
        answer.selectedAnswer = 'No answer provided';
      }
      
      const question = quiz.questions.find(
        q => q._id.toString() === answer.questionId
      );
      
      if (!question) {
        throw new ApiError(400, `Question ${answer.questionId} not found in this quiz`);
      }
      
      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) correctCount++;
      
      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      };
    });

    // Calculate results
    const totalQuestions = quiz.questions.length;
    const score = correctCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= quiz.passingScore;

    try {
      // Save attempt with userId handling for different formats
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

      // Award XP for passing if enabled
      let xpInfo = {};
      if (passed && typeof awardXP === 'function') {
        try {
          const XP_VALUES = { quizPerfectBonus: 50 }; // Default value if not defined
          const bonus = percentage === 100 ? XP_VALUES.quizPerfectBonus : 0;
          xpInfo = await awardXP(userId, 'quizPass', bonus);
        } catch (xpError) {
          console.error('Error awarding XP:', xpError);
          // Continue without failing if XP award fails
        }
      }

      return res
        .status(201)
        .json(new ApiResponse(201, { attempt, xpInfo }, 'Quiz attempt submitted successfully'));
    } catch (dbError) {
      console.error('Database error when saving quiz attempt:', dbError);
      throw new ApiError(500, `Failed to save quiz attempt: ${dbError.message}`);
    }
  } catch (error) {
    console.error('Quiz attempt submission error:', error);
    throw new ApiError(error.statusCode || 500, error.message || 'Failed to submit quiz attempt');
  }
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