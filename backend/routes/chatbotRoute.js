import express from 'express';
import { chatWithAI } from '../services/chatbotService.js';

const router = express.Router();

// Only authenticated users can use the chatbot
router.post("/chat", chatWithAI);

export default router;