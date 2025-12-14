const express = require('express');
const { body, param } = require('express-validator');
const {
  getLesson,
  updateLesson,
  deleteContentBlock,
  addContentBlock,
  updateContentBlock,
  generateHinglishAudio,
  getLessonAnalytics
} = require('../controllers/lessonController');
const { requireAuth } = require('../middlewares/auth');
const { validationErrorHandler } = require('../middlewares/errorHandler');

const router = express.Router();

// Validation rules
const lessonIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lesson ID format')
];

const updateLessonValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .optional()
    .isArray()
    .withMessage('Content must be an array'),
  body('objectives')
    .optional()
    .isArray()
    .withMessage('Objectives must be an array'),
  body('estimatedMinutes')
    .optional()
    .isInt({ min: 1, max: 240 })
    .withMessage('Estimated minutes must be between 1 and 240'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const contentBlockValidation = [
  body('block')
    .notEmpty()
    .withMessage('Block data is required'),
  body('block.type')
    .isIn(['heading', 'paragraph', 'code', 'list', 'video', 'mcq', 'image'])
    .withMessage('Invalid block type'),
  body('position')
    .optional()
    .isInt({ min: -1 })
    .withMessage('Position must be a non-negative integer or -1')
];

const blockIndexValidation = [
  param('index')
    .isInt({ min: 0 })
    .withMessage('Block index must be a non-negative integer')
];

// All routes require authentication
router.use(requireAuth);

// Lesson routes
router.route('/:id')
  .get(lessonIdValidation, validationErrorHandler, getLesson)
  .put(lessonIdValidation, updateLessonValidation, validationErrorHandler, updateLesson);

// Content block management
router.route('/:id/blocks')
  .post(lessonIdValidation, contentBlockValidation, validationErrorHandler, addContentBlock);

router.route('/:id/blocks/:index')
  .put(
    lessonIdValidation, 
    blockIndexValidation, 
    contentBlockValidation, 
    validationErrorHandler, 
    updateContentBlock
  )
  .delete(
    lessonIdValidation, 
    blockIndexValidation, 
    validationErrorHandler, 
    deleteContentBlock
  );

// Audio generation routes
router.route('/:id/audio/hinglish')
  .post(lessonIdValidation, validationErrorHandler, generateHinglishAudio);

// Analytics routes
router.route('/:id/analytics')
  .get(lessonIdValidation, validationErrorHandler, getLessonAnalytics);

module.exports = router;
