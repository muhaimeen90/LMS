import supabase from '../config/supabaseClient.js'

export const uploadFile = async (file, bucket) => {
  try {
    const fileName = `${Date.now()}_${file.originalname}`
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return {
      fileName,
      publicUrl: urlData.publicUrl
    }
  } catch (error) {
    throw new Error(`Error uploading file: ${error.message}`)
  }
}

export const deleteFile = async (fileName, bucket) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName])

    if (error) throw error
    
    return true
  } catch (error) {
    throw new Error(`Error deleting file: ${error.message}`)
  }
}