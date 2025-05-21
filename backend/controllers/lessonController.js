import supabase from '../config/supabaseClient.js'
import { ApiError } from '../utils/errorHandler.js'
import { catchAsync } from '../utils/errorHandler.js'
import { uploadFile, deleteFile } from '../utils/fileUpload.js'

export const getAllLessons = catchAsync(async (req, res) => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new ApiError(500, error.message)

  res.status(200).json({
    status: 'success',
    results: data.length,
    data
  })
})

export const getLessonById = catchAsync(async (req, res) => {
  const { id } = req.params
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new ApiError(500, error.message)
  if (!data) throw new ApiError(404, 'Lesson not found')

  res.status(200).json({
    status: 'success',
    data
  })
})

export const createLesson = catchAsync(async (req, res) => {
  const { title, content, type, difficulty } = req.body
  let fileUrl = null

  // Handle file upload if present
  if (req.file) {
    const uploadResult = await uploadFile(req.file, 'lesson-materials')
    fileUrl = uploadResult.publicUrl
  }

  const { data, error } = await supabase
    .from('lessons')
    .insert([
      { 
        title, 
        content, 
        type,
        difficulty,
        material_url: fileUrl,
        created_by: req.user.id
      }
    ])
    .select()

  if (error) throw new ApiError(400, error.message)

  res.status(201).json({
    status: 'success',
    data: data[0]
  })
})

export const updateLesson = catchAsync(async (req, res) => {
  const { id } = req.params
  const { title, content, type, difficulty } = req.body
  let fileUrl = null

  // Get existing lesson to check ownership
  const { data: existingLesson, error: fetchError } = await supabase
    .from('lessons')
    .select('created_by, material_url')
    .eq('id', id)
    .single()

  if (fetchError) throw new ApiError(500, fetchError.message)
  if (!existingLesson) throw new ApiError(404, 'Lesson not found')
  
  // Check if user is the creator of the lesson
  if (existingLesson.created_by !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to update this lesson')
  }

  // Handle file upload if present
  if (req.file) {
    // Delete old file if exists
    if (existingLesson.material_url) {
      const oldFileName = existingLesson.material_url.split('/').pop()
      await deleteFile(oldFileName, 'lesson-materials')
    }
    
    const uploadResult = await uploadFile(req.file, 'lesson-materials')
    fileUrl = uploadResult.publicUrl
  }

  const updateData = {
    title,
    content,
    type,
    difficulty,
    ...(fileUrl && { material_url: fileUrl })
  }

  const { data, error } = await supabase
    .from('lessons')
    .update(updateData)
    .eq('id', id)
    .select()

  if (error) throw new ApiError(400, error.message)

  res.status(200).json({
    status: 'success',
    data: data[0]
  })
})

export const deleteLesson = catchAsync(async (req, res) => {
  const { id } = req.params

  // Get existing lesson to check ownership and get file URL
  const { data: existingLesson, error: fetchError } = await supabase
    .from('lessons')
    .select('created_by, material_url')
    .eq('id', id)
    .single()

  if (fetchError) throw new ApiError(500, fetchError.message)
  if (!existingLesson) throw new ApiError(404, 'Lesson not found')

  // Check if user is the creator of the lesson
  if (existingLesson.created_by !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to delete this lesson')
  }

  // Delete associated file if exists
  if (existingLesson.material_url) {
    const fileName = existingLesson.material_url.split('/').pop()
    await deleteFile(fileName, 'lesson-materials')
  }

  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', id)

  if (error) throw new ApiError(400, error.message)

  res.status(200).json({
    status: 'success',
    message: 'Lesson deleted successfully'
  })
})