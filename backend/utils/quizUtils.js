import supabase from '../config/supabaseClient.js'

export const calculateQuizStats = async (quizId) => {
  try {
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('score, total_questions')
      .eq('quiz_id', quizId)

    if (error) throw error

    if (!attempts || attempts.length === 0) {
      return {
        averageScore: 0,
        totalAttempts: 0,
        highestScore: 0,
        lowestScore: 0
      }
    }

    const scores = attempts.map(attempt => (attempt.score / attempt.total_questions) * 100)
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const highestScore = Math.max(...scores)
    const lowestScore = Math.min(...scores)

    return {
      averageScore: Math.round(averageScore * 100) / 100,
      totalAttempts: attempts.length,
      highestScore: Math.round(highestScore * 100) / 100,
      lowestScore: Math.round(lowestScore * 100) / 100
    }
  } catch (error) {
    throw new Error(`Error calculating quiz stats: ${error.message}`)
  }
}

export const getUserQuizHistory = async (userId) => {
  try {
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes (
          title,
          description
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return attempts
  } catch (error) {
    throw new Error(`Error fetching user quiz history: ${error.message}`)
  }
}

export const validateQuizSubmission = (questions, answers) => {
  // Validate that all questions are answered
  const answeredQuestionIds = answers.map(a => a.questionId)
  const unansweredQuestions = questions.filter(q => !answeredQuestionIds.includes(q.id))

  if (unansweredQuestions.length > 0) {
    throw new Error('All questions must be answered')
  }

  // Validate that answers are in correct format
  const invalidAnswers = answers.filter(answer => {
    const question = questions.find(q => q.id === answer.questionId)
    return !question || typeof answer.selectedAnswer !== 'string'
  })

  if (invalidAnswers.length > 0) {
    throw new Error('Invalid answer format')
  }

  return true
}