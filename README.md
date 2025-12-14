# CourseGen: AI-Powered Course Generator

Transform any topic into a structured, multi-module online course with AI-powered content generation, interactive elements, and multilingual support.

## Features

### Core Features
- **AI Course Generation**: Transform any topic prompt into comprehensive course content using Google Gemini AI
- **Multi-Modal Content**: Support for text, code blocks, videos, images, lists, and interactive MCQs
- **Hinglish Support**: AI-generated explanations in Hinglish with audio playback
- **YouTube Integration**: Automatic video suggestions and embedding for lesson content
- **PDF Export**: Export complete lessons or courses to PDF format
- **Progress Tracking**: Monitor learning progress across modules and lessons
- **Responsive Design**: Mobile-friendly interface with dark/light mode support

### Technical Features
- **Auth0 Authentication**: Secure user authentication and authorization
- **Real-time Updates**: Dynamic content loading and updates
- **RESTful API**: Clean, documented API endpoints
- **MongoDB Storage**: Scalable database with efficient data modeling
- **Modern UI**: Built with Chakra UI for consistent design system

## Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Chakra UI** for component library and theming
- **React Router** for navigation
- **Auth0 React SDK** for authentication
- **Axios** for API communication
- **React Helmet** for SEO optimization

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Auth0** JWT authentication
- **Google Gemini AI** for content generation
- **YouTube Data API** for video integration
- **Express Rate Limit** for API protection

## Architecture

### Frontend (React + Vite)
```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── blocks/         # Content block renderers
│   │   ├── Navbar.jsx      # Navigation component
│   │   ├── Sidebar.jsx     # Course navigation
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx    # Course creation
│   │   ├── CoursePage.jsx  # Course overview
│   │   ├── LessonPage.jsx  # Lesson viewer
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utilities and API helpers
│   └── main.jsx           # App entry point
└── package.json
```

### Backend (Node.js + Express)
```
server/
├── controllers/            # Request handlers
├── models/                # MongoDB schemas
├── routes/                # API routes
├── services/              # Business logic
├── middlewares/           # Custom middleware
├── utils/                 # Helper functions
├── config/                # Configuration
└── server.js             # Server entry point
```

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- MongoDB (local or MongoDB Atlas)
- Auth0 account
- Google AI (Gemini) API key
- YouTube Data API v3 key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/RoshanJSingh/CourseGen.git
cd CourseGen
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Install frontend dependencies**
```bash
cd ../client
npm install
```

4. **Configure environment variables**

Create `server/.env` file:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/coursegen

# Auth0 Configuration
AUTH0_ISSUER=https://your-auth0-domain.auth0.com/
AUTH0_AUDIENCE=your-api-identifier

# AI Services
GEMINI_API_KEY=your-google-genai-key
YOUTUBE_API_KEY=your-youtube-data-api-key

# CORS Settings
FRONTEND_URL=http://localhost:5173
```

Create `client/.env` file:
```env
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier
VITE_API_URL=http://localhost:5000
```

5. **Start the development servers**

Backend server:
```bash
cd server
npm run dev
```

Frontend server (in new terminal):
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`

## API Documentation

### Authentication
All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Courses
- `POST /api/courses` - Generate new course from topic
- `GET /api/courses` - Get user's courses
- `GET /api/courses/:id` - Get specific course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

#### Lessons
- `GET /api/lessons/:id` - Get lesson content
- `PUT /api/lessons/:id` - Update lesson
- `POST /api/lessons/:id/blocks` - Add content block
- `PUT /api/lessons/:id/blocks/:index` - Update content block

#### AI Services
- `POST /api/ai/generate-course` - Generate course structure
- `POST /api/ai/generate-lesson` - Generate lesson content
- `POST /api/ai/translate-hinglish` - Translate to Hinglish

## Data Models

### Course
- Title, description, creator
- Modules array with lessons
- Tags, difficulty level, public/private
- Creation and update timestamps

### Module
- Title, description, course reference
- Lessons array, order, objectives
- Estimated hours, completion status

### Lesson
- Title, content blocks array
- Module reference, order, objectives
- Estimated reading time, enrichment status

### Content Block Types
1. **Heading**: Text with hierarchy levels (h1-h6)
2. **Paragraph**: Rich text content
3. **Code**: Syntax-highlighted code snippets
4. **List**: Ordered or unordered lists
5. **Video**: YouTube video embeds with metadata
6. **MCQ**: Multiple choice questions with answers
7. **Image**: Image blocks with captions

## Deployment

### Production Build

1. **Build frontend**
```bash
cd client
npm run build
```

2. **Configure production environment**
Update environment variables for production URLs and keys.

3. **Deploy backend**
The backend can be deployed to platforms like Heroku, Railway, or AWS.

4. **Deploy frontend**
The built frontend can be deployed to Vercel, Netlify, or any static hosting service.

### Environment Configuration
Ensure all environment variables are properly set in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation for common solutions

## Acknowledgments

- Google Gemini AI for content generation
- Auth0 for authentication services
- YouTube Data API for video integration
- Chakra UI for component library
- MongoDB for database services
- **YouTube Integration**: Automatic video recommendations and embedding
- **PDF Export**: Export lessons as beautifully formatted PDF documents
- **Progress Tracking**: User progress monitoring and course completion tracking
- **Responsive Design**: Modern, mobile-first UI built with Chakra UI

### Authentication & Security
- **Auth0 Integration**: Secure authentication and user management
- **Protected Routes**: Role-based access control
- **JWT Token Management**: Secure API communication
- **Data Validation**: Input sanitization and validation

### User Experience
- **Modern UI**: Clean, intuitive interface with dark/light mode support
- **Interactive Learning**: MCQ quizzes with instant feedback
- **Course Navigation**: Easy lesson-to-lesson navigation
- **Search & Discovery**: Course recommendations and suggestions
- **User Profiles**: Personal dashboard with progress analytics

## Architecture

### Frontend (React + Vite)
```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── blocks/         # Content block renderers
│   │   ├── Navbar.jsx      # Navigation component
│   │   ├── Sidebar.jsx     # Course navigation
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx    # Course creation
│   │   ├── CoursePage.jsx  # Course overview
│   │   ├── LessonPage.jsx  # Lesson viewer
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utilities and API helpers
│   └── main.jsx           # App entry point
└── package.json
```

### Backend (Node.js + Express)
```
server/
├── controllers/            # Request handlers
├── models/                # MongoDB schemas
├── routes/                # API routes
├── services/              # Business logic
├── middlewares/           # Custom middleware
├── utils/                 # Helper functions
├── config/                # Configuration
└── server.js             # Server entry point
```

##  Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- Auth0 account
- Google AI API key
- YouTube Data API key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd text-to-learn
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 4. Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/text-to-learn

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier

# Google AI
GOOGLE_API_KEY=your-google-ai-api-key

# YouTube
YOUTUBE_API_KEY=your-youtube-api-key

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📚 API Documentation

### Course Management
- `POST /api/courses` - Create a new course
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Lesson Management
- `GET /api/lessons/:id` - Get lesson details
- `PUT /api/lessons/:id` - Update lesson
- `POST /api/lessons/:id/complete` - Mark lesson complete
- `POST /api/lessons/:id/answer` - Submit quiz answer

### AI Services
- `POST /api/ai/generate-course` - Generate course from prompt
- `POST /api/ai/generate-lesson` - Generate lesson content
- `POST /api/ai/translate-hinglish` - Translate to Hinglish
- `POST /api/ai/suggestions` - Get topic suggestions

### YouTube Integration
- `GET /api/youtube/search` - Search videos
- `GET /api/youtube/video/:id` - Get video details
- `GET /api/youtube/embed/:id` - Get embed HTML
- `GET /api/youtube/captions/:id` - Get video captions

## 🔧 Content Block System

The platform supports various content block types:

### Text Blocks
- **Heading**: Different levels (H1-H6)
- **Paragraph**: Rich text content
- **List**: Ordered, unordered, checklist, pros/cons

### Media Blocks
- **Image**: With caption, fullscreen view, download
- **Video**: YouTube integration with captions
- **Code**: Syntax-highlighted code blocks

### Interactive Blocks
- **MCQ**: Single/multiple choice questions with explanations
- **Quiz**: Scored assessments with progress tracking

## 🌍 Multilingual Support

### Hinglish Integration
- AI-powered translation to Hinglish
- Audio generation for Hinglish content
- Cultural context awareness
- Code-switching support

### Implementation
```javascript
// Generate Hinglish explanation
const hinglishContent = await aiService.translateToHinglish(content, {
  context: 'educational',
  topic: 'programming',
  difficulty: 'beginner'
});

// Generate audio
const audioUrl = await aiService.generateHinglishAudio(hinglishContent);
```

## Component Usage

### Lesson Renderer
```jsx
import LessonRenderer from './components/LessonRenderer';

<LessonRenderer 
  content={lesson.content}
  onAnswer={handleMCQAnswer}
  isEditable={false}
/>
```

### PDF Export
```jsx
import LessonPDFExporter from './components/LessonPDFExporter';

<LessonPDFExporter 
  lesson={lesson}
  course={course}
  onExport={handleExportComplete}
/>
```

### Content Blocks
```jsx
// Each content block has a consistent structure
const contentBlock = {
  type: 'paragraph', // heading, code, video, mcq, list, image
  content: 'Block content...',
  // Block-specific properties
};
```

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
# Build the frontend
cd client
npm run build

# Deploy to Vercel
npx vercel --prod
```

### Backend Deployment (Render)
```bash
# Prepare backend
cd server
npm install --production

# Configure environment variables in Render dashboard
# Deploy using Render GitHub integration
```

### Production Checklist
- [ ] Environment variables configured
- [ ] MongoDB connection established
- [ ] Auth0 domains configured
- [ ] API keys secured
- [ ] CORS origins updated
- [ ] SSL certificates configured

## 🧪 Testing

### Frontend Testing
```bash
cd client
npm run test
npm run test:coverage
```

### Backend Testing
```bash
cd server
npm run test
npm run test:integration
```

### E2E Testing
```bash
# Run Cypress tests
npm run test:e2e
```

## Performance Optimization

### Frontend Optimizations
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle size analysis
- Caching strategies

### Backend Optimizations
- MongoDB indexing
- API response caching
- Rate limiting
- Request compression



 
