# 🎓 CourseGen: AI-Powered Course Generator

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node->=18.0.0-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

> **Transform any topic into a structured, multi-module online course with AI-powered content generation, interactive elements, and multilingual support.**

---

## 🚀 Features

### Core Capabilities
- **🤖 AI Course Generation**: Instantly create comprehensive course structures and content using **Google Gemini AI**.
- **📚 Multi-Modal Content**: Rich lessons with text, code blocks, videos, images, and interactive lists.
- **🇮🇳 Hinglish Support**: Unique AI explanations in Hinglish with generated audio playback.
- **🎥 YouTube Integration**: Automatic video suggestions and embedding for every lesson.
- **📄 PDF Export**: Download complete lessons as beautifully formatted PDFs.
- **📊 Progress Tracking**: Track your learning journey with detailed progress bars and completion status.
- **📱 Responsive Design**: A stunning, mobile-first UI with Dark/Light mode support.

### Technical Highlights
- **🔐 Secure Authentication**: Auth0 integration for robust user management and role-based access.
- **⚡ Real-time Updates**: Fast, dynamic content loading with React and Vite.
- **🛣️ RESTful API**: Well-structured API endpoints with validation and error handling.
- **🛡️ Enhanced Security**: Helmet, Rate Limiting, and CORS configuration.
- **🩺 System Health Monitoring**: Detailed health check endpoint for DevOps monitoring.

---

## 🛠️ Technology Stack

| Domain | Technologies |
|:---|:---|
| **Frontend** | React 18, Vite, Chakra UI, React Router, Axios, Framer Motion |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), PDFKit |
| **AI & Data** | Google Gemini AI, YouTube Data API |
| **Auth & Ops** | Auth0, Helmet, Morgan, Express-Rate-Limit |

---

## 🏗️ Architecture

### Frontend Structure
```bash
client/
├── src/
│   ├── components/    # Atomic UI components & Blocks
│   ├── pages/         # Route implementations (Home, Course, Lesson)
│   ├── hooks/         # Custom React hooks (useAuth, useCourse)
│   ├── utils/         # API clients and helpers
│   └── main.jsx       # Application entry point
```

### Backend Structure
```bash
server/
├── controllers/       # Logic for Courses, Lessons, AI
├── models/           # Mongoose Schemas (User, Course, Module, Lesson)
├── routes/           # API Route Definitions
├── services/         # External Services (Gemini, YouTube)
└── server.js         # Entry point & Configuration
```

---

## 🏁 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local instance or Atlas URI
- **API Keys**: Google Gemini AI, YouTube Data API, Auth0 Credentials

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/roshansinghabc123-cmd/CourseGen.git
    cd CourseGen
    ```

2.  **Install Dependencies**
    ```bash
    # Backend
    cd server
    npm install

    # Frontend
    cd ../client
    npm install
    ```

3.  **Environment Setup**
    Create `.env` files in both `server/` and `client/` directories based on the provided `.env.example`.

4.  **Run the Application**
    ```bash
    # Terminal 1: Backend
    cd server
    npm run dev

    # Terminal 2: Frontend
    cd client
    npm run dev
    ```

    OPEN: `http://localhost:5173`

---

## 📖 API Documentation

### Courses
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/courses` | Generate a new course from a topic |
| `GET` | `/api/courses` | List all user courses |
| `GET` | `/api/courses/:id` | Get course details |
| `PUT` | `/api/courses/:id` | Update course metadata |
| `DELETE` | `/api/courses/:id` | Delete a course |

### Lessons
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/lessons/:id` | Get lesson content |
| `PUT` | `/api/lessons/:id` | Update lesson content |
| `GET` | `/api/lessons/:id/pdf` | **Export Lesson as PDF** |
| `POST` | `/api/lessons/:id/blocks` | Add a content block |
| `POST` | `/api/ai/translate-hinglish`| Translate content to Hinglish |

### System
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/health` | Check system uptime and resources |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
