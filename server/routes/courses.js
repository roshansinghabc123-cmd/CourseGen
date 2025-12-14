const express = require('express');
const { body } = require('express-validator');
const { 
  generateCourse, 
  getCourses, 
  getCourse, 
  updateCourse, 
  deleteCourse,
  getCourseSuggestions,
  getCourseStats
} = require('../controllers/courseController');
const { requireAuth } = require('../middlewares/auth');
const { validationErrorHandler } = require('../middlewares/errorHandler');

const router = express.Router();

// Validation rules
const courseValidation = [
  body('topic')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Topic must be between 3 and 200 characters'),
];

const updateCourseValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

const suggestionValidation = [
  body('partialTopic')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Partial topic must be between 2 and 100 characters')
];

// Public routes
router.post('/suggestions', suggestionValidation, validationErrorHandler, getCourseSuggestions);

// Protected routes
router.use(requireAuth);

// Course CRUD operations
router.route('/')
  .get(getCourses)
  .post(courseValidation, validationErrorHandler, generateCourse);

router.route('/stats')
  .get(getCourseStats);

router.route('/:id')
  .get(getCourse)
  .put(updateCourseValidation, validationErrorHandler, updateCourse)
  .delete(deleteCourse);

module.exports = router;
