import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { chatWithAI } from '../services/chatbotService.js';

const router = express.Router();

// Only authenticated users can use the chatbot
router.post("/chat", protect, chatWithAI);

export default router;