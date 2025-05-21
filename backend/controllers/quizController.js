import supabase from '../config/supabaseClient.js'
import { ApiError } from '../utils/errorHandler.js'
import { catchAsync } from '../utils/errorHandler.js'
import { validateQuizSubmission, calculateQuizStats } from '../utils/quizUtils.js'

export const getAllQuizzes = catchAsync(async (req, res) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, questions(*)')
    .order('created_at', { ascending: true })

  if (error) throw new ApiError(500, error.message)

  res.status(200).json({
    status: 'success',
    results: data.length,
    data
  })
})

export const getQuizById = catchAsync(async (req, res) => {
  const { id } = req.params
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, questions(*)')
    .eq('id', id)
    .single()

  if (error) throw new ApiError(500, error.message)
  if (!data) throw new ApiError(404, 'Quiz not found')

  res.status(200).json({
    status: 'success',
    data
  })
})

export const createQuiz = catchAsync(async (req, res) => {
  const { title, description, lessonId, questions } = req.body

  if (!title || !description || !lessonId || !questions || questions.length === 0) {
    throw new ApiError(400, 'Please provide all required fields (title, description, lessonId, and questions)')
  }

  // Validate questions format
  questions.forEach((question, index) => {
    if (!question.text || !question.options || !question.correct_answer) {
      throw new ApiError(400, `Question ${index + 1} is missing required fields`)
    }
    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw new ApiError(400, `Question ${index + 1} must have at least 2 options`)
    }
    if (!question.options.includes(question.correct_answer)) {
      throw new ApiError(400, `Question ${index + 1}'s correct answer must be one of the options`)
    }
  })
  
  // First create the quiz
  const { data: quizData, error: quizError } = await supabase
    .from('quizzes')
    .insert([{
      title,
      description,
      lesson_id: lessonId,
      created_by: req.user.id
    }])
    .select()

  if (quizError) throw new ApiError(400, quizError.message)

  // Then create the questions
  const questionsWithQuizId = questions.map(question => ({
    ...question,
    quiz_id: quizData[0].id
  }))

  const { error: questionsError } = await supabase
    .from('questions')
    .insert(questionsWithQuizId)

  if (questionsError) {
    // If questions creation fails, delete the quiz
    await supabase.from('quizzes').delete().eq('id', quizData[0].id)
    throw new ApiError(400, questionsError.message)
  }

  // Fetch the complete quiz with questions
  const { data: completeQuiz, error: fetchError } = await supabase
    .from('quizzes')
    .select('*, questions(*)')
    .eq('id', quizData[0].id)
    .single()

  if (fetchError) throw new ApiError(500, fetchError.message)

  res.status(201).json({
    status: 'success',
    data: completeQuiz
  })
})

export const updateQuiz = catchAsync(async (req, res) => {
  const { id } = req.params
  const { title, description, questions } = req.body

  // Get existing quiz to check ownership
  const { data: existingQuiz, error: fetchError } = await supabase
    .from('quizzes')
    .select('created_by')
    .eq('id', id)
    .single()

  if (fetchError) throw new ApiError(500, fetchError.message)
  if (!existingQuiz) throw new ApiError(404, 'Quiz not found')

  // Check if user is the creator of the quiz
  if (existingQuiz.created_by !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to update this quiz')
  }

  // Validate questions if provided
  if (questions) {
    questions.forEach((question, index) => {
      if (!question.text || !question.options || !question.correct_answer) {
        throw new ApiError(400, `Question ${index + 1} is missing required fields`)
      }
      if (!Array.isArray(question.options) || question.options.length < 2) {
        throw new ApiError(400, `Question ${index + 1} must have at least 2 options`)
      }
      if (!question.options.includes(question.correct_answer)) {
        throw new ApiError(400, `Question ${index + 1}'s correct answer must be one of the options`)
      }
    })
  }

  // Update quiz
  const { data: quizData, error: quizError } = await supabase
    .from('quizzes')
    .update({ title, description })
    .eq('id', id)
    .select()

  if (quizError) throw new ApiError(400, quizError.message)

  // Update questions if provided
  if (questions && questions.length > 0) {
    // Delete existing questions
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('quiz_id', id)

    if (deleteError) throw new ApiError(500, deleteError.message)

    // Insert new questions
    const questionsWithQuizId = questions.map(question => ({
      ...question,
      quiz_id: id
    }))

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsWithQuizId)

    if (questionsError) throw new ApiError(400, questionsError.message)
  }

  // Fetch updated quiz with questions
  const { data: updatedQuiz, error: finalFetchError } = await supabase
    .from('quizzes')
    .select('*, questions(*)')
    .eq('id', id)
    .single()

  if (finalFetchError) throw new ApiError(500, finalFetchError.message)

  res.status(200).json({
    status: 'success',
    data: updatedQuiz
  })
})

export const deleteQuiz = catchAsync(async (req, res) => {
  const { id } = req.params

  // Get existing quiz to check ownership
  const { data: existingQuiz, error: fetchError } = await supabase
    .from('quizzes')
    .select('created_by')
    .eq('id', id)
    .single()

  if (fetchError) throw new ApiError(500, fetchError.message)
  if (!existingQuiz) throw new ApiError(404, 'Quiz not found')

  // Check if user is the creator of the quiz
  if (existingQuiz.created_by !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to delete this quiz')
  }

  // Delete questions first (due to foreign key constraint)
  const { error: questionsError } = await supabase
    .from('questions')
    .delete()
    .eq('quiz_id', id)

  if (questionsError) throw new ApiError(500, questionsError.message)

  // Then delete the quiz
  const { error: quizError } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', id)

  if (quizError) throw new ApiError(500, quizError.message)

  res.status(200).json({
    status: 'success',
    message: 'Quiz deleted successfully'
  })
})

export const getQuizStats = catchAsync(async (req, res) => {
  const { id } = req.params
  const stats = await calculateQuizStats(id)
  
  res.status(200).json({
    status: 'success',
    data: stats
  })
})

export const submitQuizAttempt = catchAsync(async (req, res) => {
  const { quizId } = req.params
  const { answers } = req.body

  if (!answers || !Array.isArray(answers)) {
    throw new ApiError(400, 'Please provide answers in the correct format')
  }

  // Get questions from the database
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId)

  if (questionsError) throw new ApiError(500, questionsError.message)
  if (!questions || questions.length === 0) {
    throw new ApiError(404, 'Quiz questions not found')
  }

  // Validate submission
  try {
    validateQuizSubmission(questions, answers)
  } catch (error) {
    throw new ApiError(400, error.message)
  }

  // Calculate score
  let score = 0
  const totalQuestions = questions.length

  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId)
    if (question && question.correct_answer === answer.selectedAnswer) {
      score++
    }
  })

  // Save attempt
  const { data: attemptData, error: attemptError } = await supabase
    .from('quiz_attempts')
    .insert([{
      quiz_id: quizId,
      user_id: req.user.id,
      score,
      total_questions: totalQuestions,
      answers: answers
    }])
    .select()

  if (attemptError) throw new ApiError(500, attemptError.message)

  // Get updated stats
  const stats = await calculateQuizStats(quizId)

  res.status(201).json({
    status: 'success',
    data: {
      score,
      totalQuestions,
      percentage: (score / totalQuestions) * 100,
      attemptId: attemptData[0].id,
      stats
    }
  })
})