import LessonQuestion from '../models/lessonQuestionModel.js';
import { getEmbedding, normalizeText } from '../services/chatbotService.js';
import { storeLessonVector, queryLessonVectors } from '../services/vectorDatabaseService.js';
import ApiError from '../utils/apiError.js';

// Add a new lesson question: embed and store in Pinecone and MongoDB
export const addLessonQuestion = async (req, res, next) => {
  try {
    const { lessonId, questionText } = req.body;
    if (!lessonId || !questionText) {
      throw new ApiError(400, 'lessonId and questionText are required');
    }
    // Create DB record first
    const newLQ = await LessonQuestion.create({ lessonId, questionText, vectorId: '' });
    // Normalize and embed
    const embedding = await getEmbedding(normalizeText(questionText));
    // Store vector using the new document ID
    const vectorId = await storeLessonVector(newLQ._id.toString(), lessonId, embedding);
    // Update record with vectorId
    newLQ.vectorId = vectorId;
    await newLQ.save();
    res.status(201).json({ status: 'success', data: newLQ });
  } catch (err) {
    next(err);
  }
};

// Get similar questions for a lesson
export const getRelatedLessonQuestions = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { question } = req.query;
    if (!lessonId || !question) {
      throw new ApiError(400, 'lessonId and question query parameter are required');
    }
    // Normalize and embed query
    const embedding = await getEmbedding(normalizeText(question));
    const matches = await queryLessonVectors(embedding, lessonId);
    // Collect vectorIds
    const ids = matches.map(m => m.id);
    // Fetch records
    const lqs = await LessonQuestion.find({ vectorId: { $in: ids } });
    res.status(200).json({ status: 'success', data: lqs, matches });
  } catch (err) {
    next(err);
  }
};
