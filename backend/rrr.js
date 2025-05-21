import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import chatbotRoute from './routes/chatbotRoute.js';
dotenv.config();

const app = express(); 
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: ["GET","POST","DELETE","PUT"],
        allowedHeaders: ["Content-Type","Authorization"],
        })
    );
  app.use(express.json());

app.use('/api', chatbotRoute);



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});
const PORT=process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});