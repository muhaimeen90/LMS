// correct demo


// import { GoogleGenerativeAI } from "@google/generative-ai";
// import dotenv from "dotenv";

// // Load stopwords (simplified list)
// const stopwords = new Set(["the", "is", "a", "an", "and", "or", "with", "from", "to", "in", "it", "of"]);

// dotenv.config();

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// // Define the system prompt for chatbot responses
// const systemPrompt = `You are a science myth-busting assistant for students in Bangladesh. Your job is to respond only to science-related questions in the domains of health, climate, physics, biology, chemistry, or technology.

// IMPORTANT: Respond ONLY with a valid JSON object with no formatting, markdown, or backticks.

// Return this exact format (and nothing else):
// {"label":"Myth or Fact","explanation":"Brief explanation in 1-3 sentences."}

// If the question is not science-related, respond:
// {"error":"This assistant only answers science-related questions in health, climate, physics, biology, chemistry, or technology."}

// If you cannot process the request, respond with:
// {"error":"Unable to process the request."}`;

// // Define the prompt for grammatical correction
// const grammarPrompt = `You are a grammar correction assistant. Your task is to rewrite the given question into a grammatically correct form, ensuring proper punctuation, capitalization, and sentence structure. Respond with only the corrected question as plain text, nothing else. Do not add extra explanations or formatting.

// For example:
// Input: "TThere a popular saying that the great wall of chinaa one of the wonders of the world is seen from the moonn is it myth or fact"
// Output: There is a popular saying that the Great Wall of China, one of the wonders of the world, is seen from the moon; is it a myth or a fact?

// Correct the following question:`;

// // Normalize text
// function normalizeText(text) {
//     return text
//         .toLowerCase()
//         .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
//         .split(/\s+/)
//         .filter(word => !stopwords.has(word))
//         .join(" ");
// }

// // Function to correct grammar using AI
// async function correctGrammarWithAI(text) {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
//     const chat = model.startChat({
//         history: [
//             {
//                 role: "user",
//                 parts: [{ text: grammarPrompt }],
//             },
//             {
//                 role: "model",
//                 parts: [{ text: "Understood. I will correct the grammar of the question and return only the corrected version as plain text." }],
//             },
//         ],
//     });
    
//     const result = await chat.sendMessage(text);
//     const response = await result.response;
//     return response.text().trim();
// }

// async function getEmbedding(text) {
//     const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" }); // Gemini embedding model
//     const result = await embeddingModel.embedContent({
//         content: { parts: [{ text: text }] },
//         taskType: "RETRIEVAL_DOCUMENT",
//     });
//     return result.embedding.values; // Returns a 768-dimensional vector
// }

// function cosineSimilarity(vec1, vec2) {
//     const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
//     const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
//     const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
//     return dotProduct / (magnitude1 * magnitude2);
// }

// export const chatWithAI = async (req, res) => {
//     const userMessage = req.body.message;
//     // For testing similarity, let's use a reference question
//     const referenceQuestion = "can you see the Great wall of china from the moon ? is it myth or fact?"; // Example for comparison
    
//     try {
//         const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
//         // Create a chat session with the system prompt
//         const chat = model.startChat({
//             history: [
//                 {
//                     role: "user",
//                     parts: [{ text: systemPrompt }],
//                 },
//                 {
//                     role: "model",
//                     parts: [{ text: "I understand. I'll respond to science questions in the specified JSON format, covering only health, climate, physics, biology, chemistry, or technology domains." }],
//                 },
//             ],
//         });
        
//         // Send the user's message
//         const result = await chat.sendMessage(userMessage);
//         const response = await result.response;
//         const text = response.text();

//         // Log the raw AI response for debugging
//         console.log("Raw AI response at 10:04 PM +06 on Wednesday, May 21, 2025:", text);

//         // Parse the response
//         let parsedResponse;
//         try {
//             // Clean the response text before parsing
//             let cleanText = text.trim();
            
//             // Remove markdown code block formatting if present
//             if (cleanText.startsWith('```json')) {
//                 cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
//             } else if (cleanText.startsWith('```')) {
//                 cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
//             }
            
//             // Remove any backticks that might be at the start or end
//             cleanText = cleanText.replace(/^`+/, '').replace(/`+$/, '');
            
//             console.log("Cleaned text for parsing:", cleanText);
//             parsedResponse = JSON.parse(cleanText);
//         } catch (parseError) {
//             console.error("Error parsing AI response:", parseError);
//             console.log("Raw text causing error:", text);
            
//             // Enhanced fallback: Try to extract JSON from potential wrapping
//             const jsonMatch = text.match(/\{.*\}/s); // Match any JSON-like object in the text
//             if (jsonMatch && jsonMatch[0]) {
//                 try {
//                     parsedResponse = JSON.parse(jsonMatch[0]);
//                 } catch (innerError) {
//                     console.error("Fallback parsing failed:", innerError);
//                     return res.status(500).json({ 
//                         error: "Invalid response format from AI", 
//                         details: "Failed to parse JSON even with fallback.",
//                         rawResponse: text // Include the raw response for debugging
//                     });
//                 }
//             } else {
//                 // If all parsing attempts fail, try regex extraction as a last resort
//                 try {
//                     // Try to extract the components individually using regex
//                     const labelMatch = text.match(/"label"\s*:\s*"([^"]+)"/i);
//                     const explanationMatch = text.match(/"explanation"\s*:\s*"([^"]+)"/i);
                    
//                     if (labelMatch && explanationMatch) {
//                         parsedResponse = {
//                             label: labelMatch[1],
//                             explanation: explanationMatch[1]
//                         };
//                     } else {
//                         return res.status(500).json({ 
//                             error: "Invalid response format from AI", 
//                             details: "No valid JSON structure found in response.",
//                             rawResponse: text
//                         });
//                     }
//                 } catch (regexError) {
//                     return res.status(500).json({ 
//                         error: "Invalid response format from AI", 
//                         details: "All parsing attempts failed.",
//                         rawResponse: text
//                     });
//                 }
//             }
//         }

//         // Check if the response contains an error (non-science question or processing error)
//         if (parsedResponse.error) {
//             return res.status(400).json({ error: parsedResponse.error });
//         }

//         // Extract label and explanation
//         const { label, explanation } = parsedResponse;

//         // Grammatically correct the user message using AI
//         const correctedUserMessage = await correctGrammarWithAI(userMessage);
//         console.log("Grammatically corrected question at 10:04 PM +06 on Wednesday, May 21, 2025:", correctedUserMessage);

//         // Test embedding generation and similarity
//         const normalizedUserMessage = normalizeText(correctedUserMessage);
//         const normalizedReference = normalizeText(referenceQuestion);

//         const userEmbedding = await getEmbedding(normalizedUserMessage);
//         console.log("User embedded: ", userEmbedding);
//         const referenceEmbedding = await getEmbedding(normalizedReference);

//         // Calculate similarity
//         const similarity = cosineSimilarity(userEmbedding, referenceEmbedding);
//         console.log("Similarity between the questions at 10:04 PM +06 on Wednesday, May 21, 2025:", similarity);

//         // For testing, log if it would be considered a duplicate (threshold 0.85)
//         if (similarity > 0.85) {
//             console.log("This question would be considered a duplicate.");
//         } else {
//             console.log("This question would be stored as unique.");
//         }

//         // Send only label and explanation to the endpoint
//         res.status(200).json({ response: { label, explanation } });
//     } catch (error) {
//         console.error("Error generating response:", error);
//         res.status(500).json({ error: "Error generating response", details: error.message });
//     }
// };







// storing main with out vector


import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Question from '../models/questions.js';
import { 
    querySimilarVectors, 
    storeVector, 
    deleteVector, 
    storeLessonVector
} from './vectorDatabaseService.js';
import VectorEntry from '../models/vectorDatabase.js';

// Load stopwords (simplified list)
const stopwords = new Set(["the", "is", "a", "an", "and", "or", "with", "from", "to", "in", "it", "of"]);

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define the system prompt for chatbot responses
const systemPrompt = `You are a science myth-busting assistant for students in Bangladesh. Your job is to respond only to science-related questions in the domains of health, climate, physics, biology, chemistry, or technology.

IMPORTANT: Respond ONLY with a valid JSON object with no formatting, markdown, or backticks.

Return this exact format (and nothing else):
{"label":"Myth or Fact","explanation":"Brief explanation in 1-3 sentences."}

If the question is not science-related, respond:
{"error":"This assistant only answers science-related questions in health, climate, physics, biology, chemistry, or technology."}

If you cannot process the request, respond with:
{"error":"Unable to process the request."}`;

// Define the educational prompt for lesson-specific questions
const educationalPrompt = `You are a science teacher helping a student understand a concept.

Please explain the following question according to the following criteria:

Grade: "{grade}"
Student Level: "{difficulty}"
Lesson Topic: "{lessonTitle}" 
Question: "{question}"

Output Format:
- A brief explanation in clear, simple language
- If needed, include an analogy or real-life example
- Use friendly tone (as if speaking to the student)

Do not answer any other questions that is not related to the lesson topic.
Example:
Question: "Why do heavier objects not fall faster than lighter ones?"
→ Output: "It might seem like heavier things should fall faster, but in reality, all objects fall at the same speed because of gravity — if there's no air getting in the way. It's like if you dropped a bowling ball and a tennis ball on the Moon, they'd hit the ground at the same time!"

IMPORTANT: Respond ONLY with a valid JSON object with no formatting, markdown, or backticks in this format:
{"label":"Answer","explanation":"Your friendly explanation here"}`;

// Define the prompt for grammatical correction
const grammarPrompt = `You are a grammar correction assistant. Your task is to rewrite the given question into a grammatically correct form, ensuring proper punctuation, capitalization, and sentence structure. Respond with only the corrected question as plain text, nothing else. Do not add extra explanations or formatting.

For example:
Input: "TThere a popular saying that the great wall of chinaa one of the wonders of the world is seen from the moonn is it myth or fact"
Output: There is a popular saying that the Great Wall of China, one of the wonders of the world, is seen from the moon; is it a myth or a fact?

Correct the following question:`;

// Normalize text function
export function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .split(/\s+/)
        .filter(word => !stopwords.has(word))
        .join(" ");
}

// Function for grammar correction
export async function correctGrammarWithAI(text) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(`${grammarPrompt} "${text}"`);
        const response = await result.response;
        const correctedText = response.text().trim();
        return correctedText;
    } catch (error) {
        console.error("Error correcting grammar:", error);
        // If grammar correction fails, return original text
        return text;
    }
}

// Get embedding for text
export async function getEmbedding(text) {
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await embeddingModel.embedContent({
        content: { parts: [{ text: text }] },
        taskType: "RETRIEVAL_DOCUMENT",
    });
    return result.embedding.values;
}

// Calculate cosine similarity
export function cosineSimilarity(vec1, vec2) {
    if (!vec1 || !vec2 || vec1.length !== vec2.length) {
        throw new Error("Invalid vectors for similarity calculation");
    }
    
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0; // Avoid division by zero
    }
    
    return dotProduct / (magnitude1 * magnitude2);
}

// Main chatbot service function
export const chatWithAI = async (req, res) => {
    const userMessage = req.body.message;
    const { lessonId, lessonTitle, grade, difficulty } = req.body;
    // Debug what we're receiving from the client
    console.log("ChatBot API received request body:", JSON.stringify(req.body));
    console.log("Message:", userMessage, "lessonId:", lessonId);
    
    try {
        // Process the question for database
        const correctedQuestion = await correctGrammarWithAI(userMessage);
        const normalizedQuestion = normalizeText(correctedQuestion);
        
        try {
            const questionEmbedding = await getEmbedding(normalizedQuestion);
            
            // First check the vector database for similar questions
            const similarVectors = await querySimilarVectors(questionEmbedding, 0.85, 5);
            let similarQuestion = null;
            let highestSimilarity = 0;
            
            if (similarVectors.length > 0) {
                // Found similar vectors, get the corresponding questions from MongoDB
                const topMatch = similarVectors[0];
                const questionId = topMatch.metadata.questionId;
                similarQuestion = await Question.findById(questionId);
                highestSimilarity = topMatch.score;
                
                console.log(`Similar question found in vector DB with similarity: ${highestSimilarity}`);
            } else {
                // No similar vectors found, perform full search in MongoDB as fallback
                console.log("No similar vectors found, checking MongoDB directly");
                const existingQuestions = await Question.find();
                
                // Only do this if there are actually questions in the database
                if (existingQuestions.length > 0) {
                    for (const question of existingQuestions) {
                        try {
                            // Check if this question already has a vector entry
                            const vectorEntry = await VectorEntry.findOne({ questionId: question._id });
                            
                            if (!vectorEntry) {
                                // This question doesn't have a vector yet, create one
                                const existingEmbedding = await getEmbedding(normalizeText(question.Question));
                                await storeVector(question._id, existingEmbedding);
                                console.log(`Created vector for existing question: ${question._id}`);
                                
                                // Calculate similarity for current comparison
                                const similarity = cosineSimilarity(questionEmbedding, existingEmbedding);
                                
                                if (similarity > highestSimilarity) {
                                    highestSimilarity = similarity;
                                    similarQuestion = question;
                                }
                            }
                        } catch (embeddingError) {
                            console.error("Error processing existing question:", embeddingError);
                        }
                    }
                }
            }
              // Continue with normal AI response handling to get label and explanation
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            
            // Determine which prompt to use based on context
            let prompt = systemPrompt;
            let initialResponse = "I understand. I'll respond to science questions in the specified JSON format.";
            
            // If we have lesson context, use the educational prompt
            if (lessonId && lessonTitle) {
                // Format the educational prompt with context
                prompt = educationalPrompt
                    .replace('{grade}', grade || 'Grade 9-12')
                    .replace('{difficulty}', difficulty || 'Intermediate')
                    .replace('{lessonTitle}', lessonTitle)
                    .replace('{question}', userMessage);
                
                initialResponse = "I understand. I'll explain this concept in a student-friendly way.";
            }
            
            // Create a chat session with the appropriate prompt
            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: prompt }],
                    },
                    {
                        role: "model",
                        parts: [{ text: initialResponse }],
                    },
                ],
            });
            
            // Send the user's message (or the complete prompt in case of lesson context)
            const result = await chat.sendMessage(lessonId && lessonTitle ? prompt : userMessage);
            const response = await result.response;
            const text = await response.text();
            
            // Clean and parse the response text
            let cleanText = text.trim();
            
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
            }
            
            cleanText = cleanText.replace(/^`+/, '').replace(/`+$/, '');
            
            // Parse the response to get label and explanation
            const parsedResponse = JSON.parse(cleanText);
            
            // If it's an error (not a science question), don't store in DB
            if (parsedResponse.error) {
                return res.status(200).json({
                    error: parsedResponse.error
                });
            }
            
            // Extract label and explanation
            const { label, explanation } = parsedResponse;
            
            // Convert label to boolean for isTrue field
            const isTrueBool = label.toLowerCase() === "fact";
              // Persist based on lesson context            // We already have lessonId from req.body at the top of the function
            if (!lessonId) {
                // No lesson context: handle database operations in main questions collection
                if (similarQuestion && highestSimilarity >= 0.85) {
                    // Update count for similar question
                    similarQuestion.count += 1;
                    await similarQuestion.save();
                    console.log("Similar question found, count incremented");
                } else if (similarVectors.length > 0) {
                    // We have similar vectors but couldn't find the question in MongoDB (data inconsistency)
                    // Don't store to avoid duplicates, just log the issue
                    console.log("Similar vectors found but corresponding question not found in database, skipping storage");
                } else {
                    // This is a new general question, store it
                    const newQuestion = new Question({
                        Question: correctedQuestion,
                        Explanation: explanation,
                        isTrue: isTrueBool,
                        count: 1
                    });
                    // Save to MongoDB and store vector
                    const savedQuestion = await newQuestion.save();
                    await storeVector(savedQuestion._id, questionEmbedding);
                    console.log("New question added to general questions collection");
                }
            } else {
                console.log("Lesson context detected, skipping general question storage");
            }              if (lessonId) {
                try {
                    // Import LessonQuestion model directly with full path for reliable resolution
                    const LessonQuestion = (await import('../models/lessonQuestionModel.js')).default;
                    console.log(`Checking for similar lesson questions before saving for lessonId: ${lessonId}`);
                    
                    // Create embedding first
                    const embedding = await getEmbedding(normalizeText(userMessage));
                    
                    // Check for similar vectors in the lesson context
                    // We're specifically looking for vectors with the same lessonId metadata
                    const similarLessonVectors = await querySimilarVectors(embedding, 0.85, 3);
                    
                    // Filter to only include vectors related to this specific lesson
                    const lessonSpecificVectors = similarLessonVectors.filter(
                        vector => vector.metadata && vector.metadata.lessonId === lessonId
                    );                      if (lessonSpecificVectors.length > 0) {
                        // Found a similar question for this lesson, don't store a duplicate
                        const similarityScore = lessonSpecificVectors[0].score.toFixed(2);
                        const similarQuestionId = lessonSpecificVectors[0].id;
                        
                        console.log(`Similar question already exists for lessonId ${lessonId}`);
                        console.log(`Similarity score: ${similarityScore}, existing question ID: ${similarQuestionId}`);
                        console.log('Skipping storage to avoid duplicate lesson questions');
                        
                        // Try to retrieve the existing question to log what it was and increment count
                        try {
                            const existingQuestion = await LessonQuestion.findById(similarQuestionId);
                            if (existingQuestion) {
                                console.log(`Similar existing question: "${existingQuestion.questionText.substring(0, 50)}..."`);
                                  // Increment the count for this question
                                const previousCount = existingQuestion.count || 1;
                                existingQuestion.count = previousCount + 1;
                                await existingQuestion.save();
                                console.log(`Incremented count for question "${existingQuestion.questionText.substring(0, 30)}..." from ${previousCount} to ${existingQuestion.count}`);
                            }
                        } catch (err) {
                            console.log('Could not retrieve or update existing similar question details:', err.message);
                        }
                    } else {                        // No similar question found, proceed with storage
                        console.log(`No similar lesson questions found, creating new entry for lessonId: ${lessonId}`);
                        
                        // Create document with initialized fields and response details
                        const newLQ = new LessonQuestion({
                            lessonId,
                            questionText: userMessage,
                            responseText: text, // Store the raw text response
                            responseLabel: label, // Store just the label ('Myth' or 'Fact')
                            responseExplanation: explanation, // Store just the explanation
                            count: 1 // Initialize count to 1 for a new question
                            // vectorId will be added after storage
                        });
                        
                        console.log(`Created new LessonQuestion instance with data:`, {
                            lessonId,
                            questionText: userMessage.substring(0, 30) + "...", // Truncate for logging
                            hasResponseText: !!text,
                            responseLabel: label,
                            count: 1  // Log that we're starting with a count of 1
                        });
                        
                        // Store vector using the new document ID
                        const storedVectorId = await storeLessonVector(newLQ._id.toString(), lessonId, embedding);
                        console.log(`Vector stored with ID: ${storedVectorId}`);
                        
                        // Set vectorId and save
                        newLQ.vectorId = storedVectorId;
                        await newLQ.save();
                        console.log(`Successfully saved lessonQuestion with ID: ${newLQ._id}, vectorId: ${storedVectorId}`);
                    }                } catch (persistError) {
                    console.error('Error persisting lesson question:', persistError.message);
                    console.error('Error stack:', persistError.stack);
                    console.error('Error persisting lesson question:', persistError);
                    // Continue processing and return response to user even if storage fails
                }
            }
            
            // Format the response nicely for the client
            return res.status(200).json({ 
                response: { label, explanation },
                isTrue: isTrueBool
            });
            
        } catch (databaseError) {
            console.error("Error processing database operations:", databaseError);
            // Continue with response even if database operations fail
              // Just return the AI response without DB operations
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            
            // Determine which prompt to use based on context, same as above
            let prompt = systemPrompt;
            let initialResponse = "I understand. I'll respond to science questions in the specified JSON format.";
            
            if (lessonId && lessonTitle) {
                prompt = educationalPrompt
                    .replace('{grade}', grade || 'Grade 9-12')
                    .replace('{difficulty}', difficulty || 'Intermediate')
                    .replace('{lessonTitle}', lessonTitle)
                    .replace('{question}', userMessage);
                
                initialResponse = "I understand. I'll explain this concept in a student-friendly way.";
            }
            
            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: prompt }],
                    },
                    {
                        role: "model",
                        parts: [{ text: initialResponse }],
                    },
                ],
            });
            
            const result = await chat.sendMessage(lessonId && lessonTitle ? prompt : userMessage);
            const response = await result.response;
            const text = await response.text();
            
            // Clean and parse response
            let cleanText = text.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
            }
            cleanText = cleanText.replace(/^`+/, '');
            
            const parsedResponse = JSON.parse(cleanText);
            
            if (parsedResponse.error) {
                return res.status(200).json({ error: parsedResponse.error });
            }
            
            const { label, explanation } = parsedResponse;
            return res.status(200).json({ 
                response: { label, explanation },
                isTrue: label.toLowerCase() === "fact"
            });
        }
    } catch (error) {
        console.error("Error in chatWithAI:", error);
        return res.status(500).json({ 
            error: "Error processing request. Please try again later."
        });
    }
};