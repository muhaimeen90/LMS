# LMS Backend API

This is the backend API for the Learning Management System (LMS). It provides endpoints for authentication, lesson management, and quiz functionality.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3001
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
CORS_ORIGIN=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Lessons

- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/:id` - Get lesson by ID
- `POST /api/lessons` - Create new lesson (requires authentication)
- `PUT /api/lessons/:id` - Update lesson (requires authentication)
- `DELETE /api/lessons/:id` - Delete lesson (requires authentication)

### Quizzes

- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes` - Create new quiz (requires authentication)
- `PUT /api/quizzes/:id` - Update quiz (requires authentication)
- `DELETE /api/quizzes/:id` - Delete quiz (requires authentication)
- `POST /api/quizzes/:quizId/submit` - Submit quiz attempt (requires authentication)
- `GET /api/quizzes/:id/stats` - Get quiz statistics

## Features

- User authentication using Supabase
- File upload support for lesson materials
- Rate limiting for API endpoints
- Input validation
- Error handling
- Request logging
- Security headers
- CORS configuration
- Compression for responses
- Health check endpoint

## File Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   ├── app.js          # Express app setup
│   └── server.js       # Entry point
├── tests/              # Test files
├── logs/              # Application logs
└── .env               # Environment variables
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run debug` - Start server in debug mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Error Handling

The API uses a centralized error handling mechanism. All errors are formatted consistently:

```json
{
  "status": "error",
  "message": "Error message",
  "stack": "Error stack trace (development only)"
}
```

## Rate Limiting

- General API endpoints: 100 requests per 15 minutes
- Authentication endpoints: 5 attempts per hour

## Security

- Helmet security headers
- CORS configuration
- Request size limits
- Input validation
- Rate limiting
- Authentication middleware

## Logging

- Request logging using Morgan
- Application logging using Winston
- Separate error and combined log files
- Console logging in development

## Development

1. Use `npm run dev` for development with hot reload
2. Check logs in the `logs` directory
3. Use the health check endpoint `/health` to verify the server is running
4. Follow ESLint rules for consistent code style

## Testing

Tests are organized in two directories:
- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests

## Production

For production deployment:
1. Set `NODE_ENV=production`
2. Ensure all environment variables are set
3. Run `npm start`
4. Monitor logs and health check endpoint