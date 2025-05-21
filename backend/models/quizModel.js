import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 2;
      },
      message: 'At least two options are required'
    }
  },
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizQuestion'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  passingScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  timeLimit: {
    type: Number, // in minutes
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizQuestion',
      required: true
    },
    selectedAnswer: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  score: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: true
  },
  timeTaken: {
    type: Number // in seconds
  }
}, { timestamps: true });

// Indexes for better query performance
quizAttemptSchema.index({ quizId: 1, userId: 1 });
quizAttemptSchema.index({ userId: 1, lessonId: 1 });

export const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);
export const Quiz = mongoose.model('Quiz', quizSchema);
export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);