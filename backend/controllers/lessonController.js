import { ApiError, catchAsync } from '../utils/errorHandler.js';
import { uploadFile, deleteFile } from '../utils/fileUpload.js';
import {
  getAllLessons as fetchAllLessons,
  getLessonById as fetchLessonById,
  createLesson as createNewLesson,
  deleteLesson as deleteLessonById
} from '../models/lessonModel.js';

export const getAllLessons = catchAsync(async (req, res) => {
  // Extract query parameters for filtering and sorting
  const { title, sort, page = 1, limit = 10 } = req.query;
  
  // Prepare options object for model
  const options = {
    filter: title ? { title } : undefined,
    sort: sort ? { [sort.split(':')[0]]: sort.split(':')[1] === 'desc' ? -1 : 1 } : undefined,
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const lessons = await fetchAllLessons(options);
  res.json({
    status: 'success',
    data: lessons
  });
});

export const getLessonById = catchAsync(async (req, res) => {
  const lesson = await fetchLessonById(req.params.id);
  if (!lesson) {
    throw new ApiError('Lesson not found', 404);
  }
  res.json({
    status: 'success',
    data: lesson
  });
});

export const createLesson = catchAsync(async (req, res) => {
  const lessonData = {
    ...req.body,
    created_by: req.user.id,
  };

  if (req.file) {
    const materialUrl = await uploadFile(req.file);
    lessonData.material_url = materialUrl;
  }

  const lesson = await createNewLesson(lessonData);
  
  res.status(201).json({
    status: 'success',
    data: lesson
  });
});

export const deleteLesson = catchAsync(async (req, res) => {
  const lesson = await fetchLessonById(req.params.id);
  
  if (!lesson) {
    throw new ApiError('Lesson not found', 404);
  }

  // Delete associated material if it exists
  if (lesson.material_url) {
    await deleteFile(lesson.material_url);
  }

  await deleteLessonById(req.params.id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});