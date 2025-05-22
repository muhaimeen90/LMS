import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import VectorEntry from '../models/vectorDatabase.js';

dotenv.config();

// Initialize Pinecone client
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

// Index configuration
const INDEX_NAME = 'science-questions';
const VECTOR_DIMENSION = 768; // Gemini embedding dimension

// Initialize the index (create if it doesn't exist)
export const initVectorDB = async () => {
    try {
        // Check if the index already exists
        const indexes = await pinecone.listIndexes();
        
        // Check if our index exists in the returned indexes
        const indexExists = indexes.indexes?.some(index => index.name === INDEX_NAME);
        
        if (!indexExists) {
            console.log(`Creating new Pinecone index: ${INDEX_NAME}`);
            await pinecone.createIndex({
                name: INDEX_NAME,
                dimension: VECTOR_DIMENSION,
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: 'aws',
                        region: 'us-east-1'  // Free tier supported region
                    }
                }
            });
            
            console.log('Waiting for index to initialize...');
            // Wait for index to be ready (usually takes 1-2 minutes)
            let isReady = false;
            while (!isReady) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
                const indexDescription = await pinecone.describeIndex(INDEX_NAME);
                isReady = indexDescription.status?.ready;
                console.log(`Index status: ${isReady ? 'ready' : 'initializing'}`);
            }
        } else {
            console.log(`Pinecone index ${INDEX_NAME} already exists`);
        }
        
        return true;
    } catch (error) {
        console.error('Error initializing vector database:', error);
        return false;
    }
};
// Get the index
export const getIndex = () => {
    return pinecone.Index(INDEX_NAME);
};

// Store a vector in the database
export const storeVector = async (questionId, embedding) => {
    try {
        const index = getIndex();
        const vectorId = questionId.toString();
        
        // Store vector in Pinecone
        await index.upsert([{
            id: vectorId,
            values: embedding,
            metadata: { questionId: questionId.toString() }
        }]);
        
        // Track the vector in MongoDB
        const vectorEntry = new VectorEntry({
            questionId,
            vectorId
        });
        
        await vectorEntry.save();
        return vectorId;
    } catch (error) {
        console.error('Error storing vector:', error);
        throw error;
    }
};

/**
 * Store a lesson question vector in Pinecone with lesson metadata
 * @param {string} lessonQuestionId - ID of the lessonQuestion document
 * @param {string} lessonId - ID of the lesson
 * @param {number[]} embedding - vector embedding
 * @returns {string} vectorId
 */
export const storeLessonVector = async (lessonQuestionId, lessonId, embedding) => {
    try {
        const index = getIndex();
        const vectorId = lessonQuestionId.toString();
        await index.upsert([{
            id: vectorId,
            values: embedding,
            metadata: { lessonId }
        }]);
        return vectorId;
    } catch (error) {
        console.error('Error storing lesson vector:', error);
        throw error;
    }
};

// Query similar vectors
export const querySimilarVectors = async (embedding, similarityThreshold = 0.85, limit = 5) => {
    try {
        const index = getIndex();
        
        const queryResponse = await index.query({
            vector: embedding,
            topK: limit,
            includeMetadata: true,
            includeValues: false
        });
        
        // Filter results by similarity threshold
        const filteredResults = queryResponse.matches.filter(
            match => match.score >= similarityThreshold
        );
        
        return filteredResults;
    } catch (error) {
        console.error('Error querying vectors:', error);
        throw error;
    }
};

/**
 * Query lesson-specific vectors by similarity
 * @param {number[]} embedding - query vector
 * @param {string} lessonId - filter for lessonId
 * @param {number} similarityThreshold 
 * @param {number} limit
 * @returns {Array} matches
 */
export const queryLessonVectors = async (embedding, lessonId, similarityThreshold = 0.8, limit = 5) => {
    try {
        const index = getIndex();
        const queryResponse = await index.query({
            vector: embedding,
            topK: limit,
            includeMetadata: true,
            includeValues: false,
            filter: { lessonId }
        });
        return queryResponse.matches.filter(match => match.score >= similarityThreshold);
    } catch (error) {
        console.error('Error querying lesson vectors:', error);
        throw error;
    }
};

// Delete a vector
export const deleteVector = async (questionId) => {
    try {
        const index = getIndex();
        const vectorId = questionId.toString();
        
        // Delete from Pinecone
        await index.deleteOne(vectorId);
        
        // Delete from MongoDB tracking
        await VectorEntry.findOneAndDelete({ vectorId });
        
        return true;
    } catch (error) {
        console.error('Error deleting vector:', error);
        throw error;
    }
};

// Initialize the vector DB on service startup
initVectorDB().then(success => {
    if (success) {
        console.log('Vector database initialized successfully');
    } else {
        console.error('Failed to initialize vector database');
    }
});