const express = require('express');
const { body } = require('express-validator');
const aiService = require('../services/aiService');
const { requireAuth } = require('../middlewares/auth');
const { asyncHandler, validationErrorHandler } = require('../middlewares/errorHandler');

const router = express.Router();

// Validation rules
const generateCourseValidation = [
  body('topic')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Topic must be between 3 and 200 characters')
];

const generateLessonValidation = [
  body('courseTitle')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Course title is required'),
  body('moduleTitle')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Module title is required'),
  body('lessonTitle')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Lesson title is required'),
  body('lessonIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Lesson index must be a non-negative integer')
];

const translateValidation = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Text must be between 1 and 5000 characters')
];

/**
 * @desc    Generate course outline from topic (AI)
 * @route   POST /api/ai/generate-course
 * @access  Private
 */
const generateCourse = asyncHandler(async (req, res) => {
  const { topic } = req.body;

  try {
    const courseData = await aiService.generateCourse(topic);

    res.json({
      success: true,
      data: courseData,
      message: 'Course outline generated successfully'
    });
  } catch (error) {
    console.error('AI course generation error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate course outline'
    });
  }
});

/**
 * @desc    Generate lesson content (AI)
 * @route   POST /api/ai/generate-lesson
 * @access  Private
 */
const generateLesson = asyncHandler(async (req, res) => {
  const { courseTitle, moduleTitle, lessonTitle, lessonIndex = 0 } = req.body;

  try {
    const lessonData = await aiService.generateLesson(
      courseTitle,
      moduleTitle,
      lessonTitle,
      lessonIndex
    );

    res.json({
      success: true,
      data: lessonData,
      message: 'Lesson content generated successfully'
    });
  } catch (error) {
    console.error('AI lesson generation error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate lesson content'
    });
  }
});

/**
 * @desc    Translate text to Hinglish
 * @route   POST /api/ai/translate-hinglish
 * @access  Private
 */
const translateToHinglish = asyncHandler(async (req, res) => {
  const { text } = req.body;

  try {
    const translatedText = await aiService.translateToHinglish(text);

    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText: translatedText
      },
      message: 'Text translated to Hinglish successfully'
    });
  } catch (error) {
    console.error('AI translation error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to translate text'
    });
  }
});

/**
 * @desc    Generate course suggestions
 * @route   POST /api/ai/course-suggestions
 * @access  Public
 */
const getCourseSuggestions = asyncHandler(async (req, res) => {
  const { partialTopic } = req.body;

  if (!partialTopic || partialTopic.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Partial topic must be at least 2 characters long'
    });
  }

  try {
    const suggestions = await aiService.generateCourseSuggestions(partialTopic);

    res.json({
      success: true,
      data: suggestions,
      query: partialTopic
    });
  } catch (error) {
    console.error('AI suggestions error:', error);
    
    res.json({
      success: true,
      data: [],
      message: 'Could not generate suggestions at this time'
    });
  }
});

/**
 * @desc    Get AI service status
 * @route   GET /api/ai/status
 * @access  Public
 */
const getAIStatus = asyncHandler(async (req, res) => {
  const status = {
    geminiApiAvailable: !!process.env.GEMINI_API_KEY,
    services: {
      courseGeneration: true,
      lessonGeneration: true,
      hinglishTranslation: true,
      courseSuggestions: true
    },
    limits: {
      maxTopicLength: 200,
      maxTextForTranslation: 5000,
      maxSuggestions: 5
    }
  };

  res.json({
    success: true,
    data: status
  });
});

// Route definitions
router.get('/status', getAIStatus);

// Public routes
router.post('/course-suggestions', getCourseSuggestions);

// Protected routes
router.use(requireAuth);

router.post('/generate-course', generateCourseValidation, validationErrorHandler, generateCourse);
router.post('/generate-lesson', generateLessonValidation, validationErrorHandler, generateLesson);
router.post('/translate-hinglish', translateValidation, validationErrorHandler, translateToHinglish);

module.exports = router;
