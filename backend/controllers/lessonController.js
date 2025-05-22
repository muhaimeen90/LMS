import { ApiError, catchAsync } from '../utils/errorHandler.js';
import { uploadFile, deleteFile } from '../utils/fileUpload.js';
import {
  getAllLessons as fetchAllLessons,
  getLessonById as fetchLessonById,
  createLesson as createNewLesson,
  updateLesson as updateLessonById,
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
  // Ensure default grade for lessons missing the field
  const data = lessons.map(doc => {
    const obj = doc.toObject();
    if (!obj.grade) obj.grade = 'grade9';
    return obj;
  });

  res.status(200).json({
    status: 'success',
    results: data.length,
    data
  });
});

export const getLessonById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const doc = await fetchLessonById(id);

  if (!doc) {
    throw new ApiError(404, 'Lesson not found');
  }

  const data = doc.toObject();
  if (!data.grade) data.grade = 'grade9';

  res.status(200).json({
    status: 'success',
    data
  });
});

export const createLesson = catchAsync(async (req, res) => {
  const { title, description, content, metadata, type, difficulty, grade } = req.body;
  let fileUrl = null;

  // Handle file upload if present
  if (req.file) {
    const uploadResult = await uploadFile(req.file, 'lesson-materials');
    fileUrl = uploadResult.publicUrl;
  }

  // Generate a unique lesson ID
  const lessonId = `lesson_${Date.now()}`;

  // Prepare lesson data
  const lessonData = { 
    id: lessonId,
    title, 
    description,
    content,
    type,
    difficulty,
    grade,
    metadata: metadata || {},
    material_url: fileUrl,
    created_by: req.user?.userId || 'anonymous'
  };

  // Add file URL to metadata if present
  if (fileUrl) {
    if (!lessonData.metadata) {
      lessonData.metadata = {};
    }
    lessonData.metadata.material_url = fileUrl;
  }

  const data = await createNewLesson(lessonData);

  res.status(201).json({
    status: 'success',
    data
  });
});

export const updateLesson = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, content, metadata, type, difficulty, grade } = req.body;
  
  // Check if lesson exists
  const existingLesson = await fetchLessonById(id);
  if (!existingLesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  // Optional: Check ownership if you're maintaining creator-based access control
  // if (existingLesson.created_by !== req.user.userId) {
  //   throw new ApiError(403, 'You are not authorized to update this lesson');
  // }

  let fileUrl = null;
  // Handle file upload if present
  if (req.file) {
    // Delete old file if exists
    if (existingLesson.metadata?.material_url) {
      const oldFileName = existingLesson.metadata.material_url.split('/').pop();
      await deleteFile(oldFileName, 'lesson-materials');
    }
    
    const uploadResult = await uploadFile(req.file, 'lesson-materials');
    fileUrl = uploadResult.publicUrl;
  }

  // Prepare updated data
  const updateData = {
    ...(title && { title }),
    ...(description && { description }),
    ...(content && { content }),
    ...(type && { type }),
    ...(difficulty && { difficulty }),
    ...(grade && { grade }),
  };

  // Handle metadata update
  if (metadata || fileUrl) {
    updateData.metadata = {
      ...(existingLesson.metadata || {}),
      ...(metadata ? (typeof metadata === 'string' ? JSON.parse(metadata) : metadata) : {}),
      ...(fileUrl && { material_url: fileUrl })
    };
  }

  const data = await updateLessonById(id, updateData);

  res.status(200).json({
    status: 'success',
    data
  });
});

export const deleteLesson = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Get existing lesson to check ownership and get file URL
  const existingLesson = await fetchLessonById(id);
  if (!existingLesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  // Optional: Check ownership if you're maintaining creator-based access control
  // if (existingLesson.created_by !== req.user.userId) {
  //   throw new ApiError(403, 'You are not authorized to delete this lesson');
  // }

  // Delete associated file if exists
  if (existingLesson.metadata?.material_url) {
    const fileName = existingLesson.metadata.material_url.split('/').pop();
    await deleteFile(fileName, 'lesson-materials');
  }

  await deleteLessonById(id);

  res.status(200).json({
    status: 'success',
    message: 'Lesson deleted successfully'
  });
});