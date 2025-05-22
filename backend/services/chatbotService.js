

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
    deleteVector 
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

// // Main chatbot service function
// export const chatWithAI = async (req, res) => {
//     const userMessage = req.body.message;
    
//     try {
//         // Process the question for database
//         const correctedQuestion = await correctGrammarWithAI(userMessage);
//         const normalizedQuestion = normalizeText(correctedQuestion);
//         // Inside the database operations try-catch block, update this section:

// try {
//     const questionEmbedding = await getEmbedding(normalizedQuestion);
    
//     // Check for similar questions
//     const existingQuestions = await Question.find();
//     let similarQuestion = null;
//     let highestSimilarity = 0;
    
//     // Continue with normal AI response handling to get label and explanation first
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
//     // Create a chat session with the system prompt
//     const chat = model.startChat({
//         history: [
//             {
//                 role: "user",
//                 parts: [{ text: systemPrompt }],
//             },
//             {
//                 role: "model",
//                 parts: [{ text: "I understand. I'll respond to science questions in the specified JSON format." }],
//             },
//         ],
//     });
    
//     // Send the user's message
//     const result = await chat.sendMessage(userMessage);
//     const response = await result.response;
//     const text = response.text();
    
//     // Clean the response text before parsing
//     let cleanText = text.trim();
    
//     if (cleanText.startsWith('```json')) {
//         cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
//     } else if (cleanText.startsWith('```')) {
//         cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
//     }
    
//     cleanText = cleanText.replace(/^`+/, '').replace(/`+$/, '');
    
//     // Parse the response to get label and explanation
//     const parsedResponse = JSON.parse(cleanText);
    
//     // If it's an error (not a science question), don't store in DB
//     if (parsedResponse.error) {
//         return res.status(200).json({
//             error: parsedResponse.error
//         });
//     }
    
//     // Extract label and explanation
//     const { label, explanation } = parsedResponse;
    
//     // Convert label to boolean for isTrue field
//     const isTrueBool = label.toLowerCase() === "fact";
    
//     // Check if database has any questions at all
//     if (existingQuestions.length === 0) {
//         console.log("Database is empty. Adding first question.");
//         // This is the first question, store it directly
//         const firstQuestion = new Question({
//             Question: correctedQuestion,
//             Explanation: explanation,
//             isTrue: isTrueBool,
//             count: 1
//         });
//         await firstQuestion.save();
//     } else {
//         // Database has questions, check for similarities
//         for (const question of existingQuestions) {
//             try {
//                 const existingEmbedding = await getEmbedding(normalizeText(question.Question));
//                 const similarity = cosineSimilarity(questionEmbedding, existingEmbedding);
                
//                 if (similarity > highestSimilarity) {
//                     highestSimilarity = similarity;
//                     similarQuestion = question;
//                 }
//             } catch (embeddingError) {
//                 console.error("Error getting embedding for existing question:", embeddingError);
//             }
//         }
        
//         // Handle database operation based on similarity
//         if (similarQuestion && highestSimilarity >= 0.85) {
//             // Update count for similar question
//             similarQuestion.count += 1;
//             await similarQuestion.save();
//             console.log("Similar question found, count incremented");
//         } else {
//             // This is a new question, store it
//             const newQuestion = new Question({
//                 Question: correctedQuestion,
//                 Explanation: explanation,
//                 isTrue: isTrueBool,
//                 count: 1
//             });
//             await newQuestion.save();
//             console.log("New question added to database");
//         }
//     }
    
//     // Format the response nicely for the client
//     return res.status(200).json({ 
//         response: { label, explanation },
//         isTrue: isTrueBool
//     });
    
// } catch (databaseError) {
//     console.error("Error processing database operations:", databaseError);
//     // Continue with response even if database operations fail
// }
// //         try {
// //     const questionEmbedding = await getEmbedding(normalizedQuestion);
    
// //     // Check for similar questions
// //     const existingQuestions = await Question.find();
// //     let similarQuestion = null;
// //     let highestSimilarity = 0;
    
// //     // Check if database has any questions at all
// //     if (existingQuestions.length === 0) {
// //         console.log("Database is empty. Adding first question.");
// //         // This is the first question, store it directly
// //         const firstQuestion = new Question({
// //             Question: correctedQuestion,
// //             count: 1
// //         });
// //         await firstQuestion.save();
// //     } else {
// //         // Database has questions, check for similarities
// //         for (const question of existingQuestions) {
// //             try {
// //                 const existingEmbedding = await getEmbedding(normalizeText(question.Question));
// //                 const similarity = cosineSimilarity(questionEmbedding, existingEmbedding);
                
// //                 if (similarity > highestSimilarity) {
// //                     highestSimilarity = similarity;
// //                     similarQuestion = question;
// //                 }
// //             } catch (embeddingError) {
// //                 console.error("Error getting embedding for existing question:", embeddingError);
// //             }
// //         }
        
// //         // Handle database operation based on similarity
// //         if (similarQuestion && highestSimilarity >= 0.85) {
// //             // Update count for similar question
// //             similarQuestion.count += 1;
// //             await similarQuestion.save();
// //             console.log("Similar question found, count incremented");
// //         } else {
// //             // This is a new question, store it
// //             const newQuestion = new Question({
// //                 Question: correctedQuestion,
// //                 count: 1
// //             });
// //             await newQuestion.save();
// //             console.log("New question added to database");
// //         }
// //     }
// // } catch (databaseError) {
// //     console.error("Error processing database operations:", databaseError);
// //     // Continue with response even if database operations fail
// // }
        
// //         // Continue with normal AI response handling
// //         const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
// //         // Create a chat session with the system prompt
// //         const chat = model.startChat({
// //             history: [
// //                 {
// //                     role: "user",
// //                     parts: [{ text: systemPrompt }],
// //                 },
// //                 {
// //                     role: "model",
// //                     parts: [{ text: "I understand. I'll respond to science questions in the specified JSON format." }],
// //                 },
// //             ],
// //         });
        
// //         // Send the user's message
// //         const result = await chat.sendMessage(userMessage);
// //         const response = await result.response;
// //         const text = response.text();
        
// //         // Clean the response text before parsing
// //         let cleanText = text.trim();
        
// //         // Remove markdown code block formatting if present
// //         if (cleanText.startsWith('```json')) {
// //             cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
// //         } else if (cleanText.startsWith('```')) {
// //             cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
// //         }
        
// //         // Remove any backticks that might be at the start or end
// //         cleanText = cleanText.replace(/^`+/, '').replace(/`+$/, '');
        
// //         try {
// //             // Try to parse the response as JSON
// //             const parsedResponse = JSON.parse(cleanText);
            
// //             // If the response contains an error field
// //             if (parsedResponse.error) {
// //                 return res.status(200).json({
// //                     error: parsedResponse.error
// //                 });
// //             }
            
// //             // Extract response components
// //             const { label, explanation } = parsedResponse;
            
// //             // Format the response nicely
            
// //             return res.status(200).json({ 
// //                 response: { label, explanation } 
// //             });
// //         } catch (parseError) {
// //             console.error("Error parsing AI response:", parseError);
// //             console.log("Raw text causing error:", cleanText);
            
// //             // If parsing fails, return a friendly message
// //             return res.status(200).json({
// //                 error: "I had trouble understanding that. Please try rephrasing your question.",
// //                 rawResponse: cleanText
// //             });
// //         }
//     } catch (error) {
//         console.error("Error in chatWithAI:", error);
//         return res.status(500).json({ 
//             error: "Error processing request. Please try again later."
//         });
//     }
// };

// Main chatbot service function
export const chatWithAI = async (req, res) => {
    const userMessage = req.body.message;
    
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
            
            // Create a chat session with the system prompt
            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "I understand. I'll respond to science questions in the specified JSON format." }],
                    },
                ],
            });
            
            // Send the user's message
            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const text = response.text();
            
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
            
            // Handle database operations based on similarity check results
            if (similarQuestion && highestSimilarity >= 0.85) {
                // Update count for similar question
                similarQuestion.count += 1;
                await similarQuestion.save();
                console.log("Similar question found, count incremented");
            } else {
                // This is a new question, store it
                const newQuestion = new Question({
                    Question: correctedQuestion,
                    Explanation: explanation,
                    isTrue: isTrueBool,
                    count: 1
                });
                
                // Save to MongoDB
                const savedQuestion = await newQuestion.save();
                
                // Store the vector embedding
                await storeVector(savedQuestion._id, questionEmbedding);
                
                console.log("New question added to database with vector embedding");
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
            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "I understand. I'll respond to science questions in the specified JSON format." }],
                    },
                ],
            });
            
            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const text = response.text();
            
            // Clean and parse response
            let cleanText = text.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
            }
            cleanText = cleanText.replace(/^`+/, '').replace(/`+$/, '');
            
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