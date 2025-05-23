# SciVerse LMS

A full-stack Learning Management System for interactive, accessible science lessons with AI-powered Q&A.

## Prerequisites

- Node.js v16+ and npm
- MongoDB instance (local or cloud)
- Pinecone API key (for vector storage)
- Google Generative AI API key (for chatbot)

## Folder Structure

```
LMS/
├── backend/        # Express.js API
└── sciverse/       # Next.js frontend
```

---

## 1. Backend Setup

1. Navigate to backend  
   ```bash
   cd backend
   ```

2. Install dependencies  
   ```bash
   npm install
   ```

3. Create a `.env` with:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/your-db
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=http://localhost:3000
   GEMINI_API_KEY=your_google_genai_key
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_ENV=your_pinecone_env
   ```

4. Start in development mode  
   ```bash
   npm run dev
   ```

   - Runs on http://localhost:5000  
   - Health check: GET `/health`

---

## 2. Frontend Setup

1. Navigate to sciverse  
   ```bash
   cd sciverse
   ```

2. Install dependencies  
   ```bash
   npm install
   ```

3. Create a `.env.local` with:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
   ```

4. Start Next.js dev server  
   ```bash
   npm run dev
   ```

   - Opens at http://localhost:3000  

---

## 3. Usage

- **Backend API**  
  - Auth: `/api/auth/*`  
  - Lessons: `/api/lessons/*`  
  - Chatbot Q&A: `/api/chat`  
  - Lesson-specific FAQs: `/api/lesson-questions/:lessonId/top`

- **Frontend**  
  - Browse lessons at `/lessons`  
  - Create lessons/quizzes (teacher/admin)  
  - AI chat in lessons and fact-checker pages  
  - Personalized profile at `/profile`

---

## 4. Scripts

In each directory:

- `npm run dev` – start in development (hot reload)  
- `npm start` – start production server  
- `npm run lint` – run ESLint  

---

## 5. Testing & Linting

- **Backend**:  
  ```bash
  cd backend
  npm run lint
  npm test
  ```
- **Frontend**:  
  ```bash
  cd sciverse
  npm run lint
  ```

---

Enjoy building and learning with SciVerse! 🚀
