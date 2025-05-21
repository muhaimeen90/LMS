import Question from '../models/questions.js';
import { getEmbedding, normalizeText, correctGrammarWithAI, cosineSimilarity } from '../services/chatbotService.js';

// Similarity threshold - adjust as needed
const SIMILARITY_THRESHOLD = 0.85;

/**
 * Get all questions
 */
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ count: -1 });
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: error.message });
  }
};
export const addQuestion = async (req, res) => {
    
    try {
        const {question, Explanation, check} = req.body;
        const newQuestion = new Question({
        Question: question,
        Explanation: Explanation || "No explanation provided",
        isTrue: check === 'Myth' ? false : true,
        count: 1
      });
      await newQuestion.save();
       return res.status(201).json({
      success: true,
      message: "Question added successfully",
      question: newQuestion
    });
    }
    catch (error){
    console.error("Error uploading data", error);
    res.status(500).json({ error: error.message });
    }
};

/**
 * Get question by ID
 */
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    console.error("Error fetching question by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Process new question - check similarity and store if unique
 */
// export const processQuestion = async (req, res) => {
//   try {
//     const { Question } = req.body;
    
//     if (!Question || typeof Question !== 'string') {
//       return res.status(400).json({ error: "Valid question text is required" });
//     }
    
//     // Step 1: Correct grammar
//     const correctedQuestion = await correctGrammarWithAI(Question);
//     console.log("Grammar corrected:", correctedQuestion);
    
//     // Step 2: Get embedding for the corrected question
//     const normalizedQuestion = normalizeText(correctedQuestion);
//     const embedding = await getEmbedding(normalizedQuestion);
    
//     // Step 3: Get all existing questions
//     const existingQuestions = await Question.find();
    
//     // Step 4: Check for similarity with existing questions
//     let similarQuestion = null;
//     let highestSimilarity = 0;
    
//     for (const question of existingQuestions) {
//       try {
//         // Get embedding for existing question
//         const existingEmbedding = await getEmbedding(normalizeText(question.Question));
        
//         // Calculate similarity
//         const similarity = cosineSimilarity(embedding, existingEmbedding);
//         console.log(`Similarity with "${question.Question}": ${similarity}`);
        
//         if (similarity > highestSimilarity) {
//           highestSimilarity = similarity;
//           similarQuestion = question;
//         }
//       } catch (embeddingError) {
//         console.error("Error calculating similarity:", embeddingError);
//         // Continue with next question
//       }
//     }
    
//     console.log("Highest similarity found:", highestSimilarity);
    
//     // Step 5: If similar question exists, update count; otherwise, create new
//     if (similarQuestion && highestSimilarity >= SIMILARITY_THRESHOLD) {
//       // Update count for similar question
//       similarQuestion.count += 1;
//       await similarQuestion.save();
      
//       return res.status(200).json({
//         message: "Similar question found and count incremented",
//         question: similarQuestion,
//         similarity: highestSimilarity
//       });
//     } else {
//       // Create new question
//       const newQuestion = new Question({
//         Question: correctedQuestion,
//         count: 1
//       });
      
//       const savedQuestion = await newQuestion.save();
      
//       return res.status(201).json({
//         message: "New question added to database",
//         question: savedQuestion,
//         similarity: similarQuestion ? highestSimilarity : 0
//       });
//     }
//   } catch (error) {
//     console.error("Error processing question:", error);
//     res.status(500).json({ error: error.message });
//   }
// };
/**
 * Process new question - check similarity and store if unique
 */

/**
 * Delete question by ID
 */
export const deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    
    if (!deletedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }
    
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get top questions by count
 */
export const getTopQuestions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const questions = await Question.find()
      .sort({ count: -1 })
      .limit(limit);
    
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching top questions:", error);
    res.status(500).json({ error: error.message });
  }
};
