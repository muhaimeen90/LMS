import mongoose from 'mongoose';

const lessonQuestionSchema = new mongoose.Schema({
  lessonId: { type: String, required: true, index: true },
  questionText: { type: String, required: true },
  responseText: { type: String, default: '' },
  responseLabel: { type: String, default: '' }, // 'Myth' or 'Fact'
  responseExplanation: { type: String, default: '' },
  vectorId: { type: String, required: false, unique: true, sparse: true },
  count: { type: Number, default: 1 }, // Track how many times this question has been asked
}, { timestamps: true });

export default mongoose.model('LessonQuestion', lessonQuestionSchema);
