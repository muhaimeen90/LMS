import mongoose from 'mongoose';

const lessonQuestionSchema = new mongoose.Schema({
  lessonId: { type: String, required: true, index: true },
  questionText: { type: String, required: true },
  vectorId: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model('LessonQuestion', lessonQuestionSchema);
