# Text-to-Learn Backend

AI-Powered Course Generator Backend API built with Node.js, Express, and MongoDB.

## Features

- 🤖 **AI-Powered Course Generation**: Generate structured courses from simple topic prompts
- 🔐 **Auth0 Authentication**: Secure user authentication and authorization
- 📚 **Rich Lesson Content**: Support for various content types (text, code, videos, quizzes)
- 🌐 **YouTube Integration**: Automatic video suggestions for lessons
- 🗣️ **Multilingual Support**: Hinglish translations for enhanced accessibility
- 📊 **Analytics**: Course and lesson analytics for users
- 🚀 **RESTful API**: Clean, well-documented API endpoints

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Auth0 (JWT)
- **AI Service**: Google Gemini AI
- **Video Service**: YouTube Data API v3
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 18.0.0 or higher
- MongoDB (local or MongoDB Atlas)
- Auth0 account
- Google AI (Gemini) API key
- YouTube Data API v3 key

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd text-to-learn/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/text-to-learn
   
   # Auth0 Configuration
   AUTH0_ISSUER=https://your-auth0-domain.auth0.com/
   AUTH0_AUDIENCE=your-api-identifier
   
   # AI Services
   GEMINI_API_KEY=your-google-genai-key
   YOUTUBE_API_KEY=your-youtube-data-api-key
   
   # CORS Settings
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication Endpoints

- `GET /api/auth/status` - Get authentication configuration
- `GET /api/auth/profile` - Get user profile (Protected)
- `GET /api/auth/verify` - Verify JWT token (Protected)

### Course Endpoints

- `POST /api/courses/suggestions` - Get course suggestions (Public)
- `GET /api/courses` - Get user courses (Protected)
- `POST /api/courses` - Generate new course (Protected)
- `GET /api/courses/stats` - Get course statistics (Protected)
- `GET /api/courses/:id` - Get single course (Protected)
- `PUT /api/courses/:id` - Update course (Protected)
- `DELETE /api/courses/:id` - Delete course (Protected)

### Lesson Endpoints

- `GET /api/lessons/:id` - Get lesson with content generation (Protected)
- `PUT /api/lessons/:id` - Update lesson (Protected)
- `POST /api/lessons/:id/blocks` - Add content block (Protected)
- `PUT /api/lessons/:id/blocks/:index` - Update content block (Protected)
- `DELETE /api/lessons/:id/blocks/:index` - Delete content block (Protected)
- `POST /api/lessons/:id/audio/hinglish` - Generate Hinglish audio (Protected)
- `GET /api/lessons/:id/analytics` - Get lesson analytics (Protected)

### AI Service Endpoints

- `GET /api/ai/status` - Get AI service status (Public)
- `POST /api/ai/course-suggestions` - Generate course suggestions (Public)
- `POST /api/ai/generate-course` - Generate course outline (Protected)
- `POST /api/ai/generate-lesson` - Generate lesson content (Protected)
- `POST /api/ai/translate-hinglish` - Translate to Hinglish (Protected)

### YouTube Integration Endpoints

- `GET /api/youtube/search` - Search educational videos (Public)
- `GET /api/youtube/trending` - Get trending educational videos (Public)
- `GET /api/youtube/validate` - Validate YouTube URL (Public)
- `GET /api/youtube/captions/:videoId` - Get video captions (Public)
- `GET /api/youtube/embed/:videoId` - Get embed HTML (Public)

## Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── courseController.js  # Course business logic
│   └── lessonController.js  # Lesson business logic
├── middlewares/
│   ├── auth.js             # Auth0 authentication
│   └── errorHandler.js     # Error handling
├── models/
│   ├── Course.js           # Course schema
│   ├── Module.js           # Module schema
│   └── Lesson.js           # Lesson schema
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── courses.js          # Course routes
│   ├── lessons.js          # Lesson routes
│   ├── ai.js               # AI service routes
│   └── youtube.js          # YouTube integration routes
├── services/
│   ├── aiService.js        # Google Gemini AI integration
│   └── youtubeService.js   # YouTube Data API integration
├── utils/
│   └── helpers.js          # Utility functions
└── server.js               # Application entry point
```

## Data Models

### Course Model
- Basic course information (title, description, creator)
- References to modules
- Metadata (tags, difficulty, estimated hours)

### Module Model
- Module information within a course
- References to lessons
- Order and objectives

### Lesson Model
- Detailed lesson content as flexible JSON blocks
- Support for multiple content types
- AI enrichment status and metadata

## Content Block Types

The lesson content system supports various block types:

- **Heading**: `{ type: "heading", text: "...", level: 2 }`
- **Paragraph**: `{ type: "paragraph", text: "..." }`
- **Code**: `{ type: "code", language: "javascript", text: "...", title: "..." }`
- **List**: `{ type: "list", style: "unordered", items: [...] }`
- **Video**: `{ type: "video", query: "...", url: "..." }`
- **MCQ**: `{ type: "mcq", question: "...", options: [...], answer: 1, explanation: "..." }`
- **Image**: `{ type: "image", url: "...", alt: "...", caption: "..." }`

## Security Features

- **JWT Authentication**: Auth0-based secure authentication
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: HTTP security headers
- **Environment Variables**: Sensitive data protection

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional validation details
}
```

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

### Code Style

- Follow ES6+ standards
- Use async/await for asynchronous operations
- Implement proper error handling
- Add JSDoc comments for functions
- Use meaningful variable and function names

## Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up Auth0 production application
4. Configure production API keys

### Recommended Deployment Platforms

- **Render** (recommended for this project)
- **Heroku**
- **DigitalOcean App Platform**
- **AWS Elastic Beanstalk**

## Monitoring and Logging

- Request logging with Morgan
- Error logging to console
- Health check endpoint at `/health`
- Graceful shutdown handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## Changelog

### Version 1.0.0
- Initial release
- AI-powered course generation
- Auth0 integration
- YouTube video integration
- Multilingual support foundation
- RESTful API with comprehensive endpoints
