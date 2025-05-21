import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import crypto from 'crypto';
import path from 'path';
import logger from './logger.js';

// Maintain a reference to the GridFS bucket
let bucket;

/**
 * Initialize the GridFS bucket
 * @returns {GridFSBucket} The GridFS bucket
 */
export const getGridFSBucket = () => {
  if (!bucket) {
    if (!mongoose.connection.db) {
      throw new Error('MongoDB connection not established');
    }
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
  }
  return bucket;
};

/**
 * Upload a file to MongoDB GridFS
 * @param {Object} file - Express file object
 * @param {string} bucketName - Virtual bucket name for organizing files
 * @returns {Promise<Object>} File metadata
 */
export const uploadFile = async (file, bucketName = 'default') => {
  try {
    const bucket = getGridFSBucket();
    
    // Generate a unique filename
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const fileName = `${uniqueId}_${file.originalname}`;
    const fileExtension = path.extname(file.originalname);
    const contentType = file.mimetype;
    
    // Create a writable stream to GridFS
    const uploadStream = bucket.openUploadStream(fileName, {
      contentType,
      metadata: {
        bucketName,
        originalName: file.originalname,
        fileExtension,
        uploadDate: new Date()
      }
    });
    
    // Create a promise to handle the stream
    const uploadPromise = new Promise((resolve, reject) => {
      uploadStream.once('finish', function() {
        resolve({
          fileName,
          fileId: uploadStream.id,
          publicUrl: `/api/files/${uploadStream.id}`,
          contentType,
          bucketName
        });
      });
      
      uploadStream.once('error', reject);
    });
    
    // Write the file buffer to the stream
    uploadStream.write(file.buffer);
    uploadStream.end();
    
    return await uploadPromise;
  } catch (error) {
    logger.error(`Error uploading file: ${error.message}`);
    throw new Error(`Error uploading file: ${error.message}`);
  }
};

/**
 * Delete a file from MongoDB GridFS
 * @param {string} fileId - The file ID or name to delete
 * @param {string} bucketName - Virtual bucket name for organizing files (not used with GridFS but kept for API compatibility)
 * @returns {Promise<boolean>} Success status
 */
export const deleteFile = async (fileId, bucketName = 'default') => {
  try {
    const bucket = getGridFSBucket();
    
    // If fileId is a string but not a MongoDB ObjectId, try to find by filename
    if (typeof fileId === 'string' && !mongoose.Types.ObjectId.isValid(fileId)) {
      // Find the file by filename
      const filesCollection = bucket.s.filesCollection;
      const file = await filesCollection.findOne({ filename: fileId });
      
      if (!file) {
        throw new Error(`File ${fileId} not found`);
      }
      
      fileId = file._id;
    }
    
    // Convert string ID to ObjectId if needed
    if (typeof fileId === 'string') {
      fileId = new mongoose.Types.ObjectId(fileId);
    }
    
    await bucket.delete(fileId);
    logger.info(`File ${fileId} deleted successfully`);
    return true;
  } catch (error) {
    logger.error(`Error deleting file: ${error.message}`);
    throw new Error(`Error deleting file: ${error.message}`);
  }
};

/**
 * Get a file stream from MongoDB GridFS
 * @param {string} fileId - The file ID to retrieve
 * @returns {Promise<Object>} File stream and metadata
 */
export const getFileStream = async (fileId) => {
  try {
    const bucket = getGridFSBucket();
    
    // Convert string ID to ObjectId if needed
    if (typeof fileId === 'string' && mongoose.Types.ObjectId.isValid(fileId)) {
      fileId = new mongoose.Types.ObjectId(fileId);
    }
    
    // Find file metadata first to verify it exists
    const filesCollection = bucket.s.filesCollection;
    const fileInfo = await filesCollection.findOne({ _id: fileId });
    
    if (!fileInfo) {
      throw new Error(`File with ID ${fileId} not found`);
    }
    
    // Create a readable stream
    const downloadStream = bucket.openDownloadStream(fileId);
    
    return {
      stream: downloadStream,
      metadata: fileInfo,
      contentType: fileInfo.contentType,
      length: fileInfo.length,
      filename: fileInfo.filename
    };
  } catch (error) {
    logger.error(`Error retrieving file: ${error.message}`);
    throw new Error(`Error retrieving file: ${error.message}`);
  }
};

/**
 * Find files by metadata
 * @param {Object} query - Query object to find files
 * @returns {Promise<Array>} Array of file metadata
 */
export const findFiles = async (query = {}) => {
  try {
    const bucket = getGridFSBucket();
    const filesCollection = bucket.s.filesCollection;
    
    // Add bucket filter if provided
    if (query.bucketName) {
      query['metadata.bucketName'] = query.bucketName;
      delete query.bucketName;
    }
    
    const files = await filesCollection.find(query).toArray();
    return files.map(file => ({
      fileId: file._id,
      fileName: file.filename,
      contentType: file.contentType,
      size: file.length,
      uploadDate: file.uploadDate,
      metadata: file.metadata,
      publicUrl: `/api/files/${file._id}`
    }));
  } catch (error) {
    logger.error(`Error finding files: ${error.message}`);
    throw new Error(`Error finding files: ${error.message}`);
  }
};