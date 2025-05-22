import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Get MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';

// Configure MongoDB connection options - removed deprecated options
const options = {
  serverSelectionTimeoutMS: 15000, // Increased timeout to 15 seconds
  socketTimeoutMS: 45000, // How long the MongoDB driver will wait before timing out a socket operation
  maxPoolSize: 10, // Maintain up to 10 socket connections
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
};

/**
 * Connect to MongoDB
 */
export const connectToMongoDB = async () => {
  try {
    logger.info('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, options);
    logger.info('Successfully connected to MongoDB');
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error(`MongoDB connection error: ${error}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
    return mongoose.connection;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    throw error; // Let the calling code handle the error instead of exiting process
  }
};

/**
 * Check if MongoDB connection is ready
 * @returns {boolean} Connection status
 */
export const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Disconnect from MongoDB
 */
export const disconnectFromMongoDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error(`Error disconnecting from MongoDB: ${error.message}`);
  }
};

export default { connectToMongoDB, isConnected, disconnectFromMongoDB };