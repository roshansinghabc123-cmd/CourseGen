const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const aiService = require('../services/aiService');
const { asyncHandler } = require('../middlewares/errorHandler');
const { validationResult } = require('express-validator');

/**
 * @desc    Generate a new course from topic
 * @route   POST /api/courses/generate
 * @access  Private
 */
const generateCourse = asyncHandler(async (req, res) => {
  const { topic } = req.body;

  if (!topic || topic.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Topic is required'
    });
  }

  // Generate course using AI
  const courseData = await aiService.generateCourse(topic.trim());

  // Create course in database
  const course = new Course({
    title: courseData.title,
    description: courseData.description,
    creator: req.user.sub,
    tags: courseData.tags || [],
    difficulty: courseData.difficulty || 'beginner',
    estimatedHours: courseData.estimatedHours || 10
  });

  await course.save();

  // Create modules and lessons
  for (let i = 0; i < courseData.modules.length; i++) {
    const moduleData = courseData.modules[i];
    
    const module = new Module({
      title: moduleData.title,
      description: moduleData.description || '',
      course: course._id,
      order: moduleData.order || i,
      objectives: moduleData.objectives || []
    });

    await module.save();

    // Create lesson placeholders (content will be generated on-demand)
    for (let j = 0; j < moduleData.lessons.length; j++) {
      const lessonData = moduleData.lessons[j];
      
      const lesson = new Lesson({
        title: lessonData.title,
        content: [
          {
            type: 'paragraph',
            text: 'Content will be generated when you first view this lesson.'
          }
        ],
        module: module._id,
        order: lessonData.order || j,
        isEnriched: false
      });

      await lesson.save();
      await module.addLesson(lesson._id);
    }

    await course.addModule(module._id);
  }

  // Populate the response
  const populatedCourse = await Course.findById(course._id)
    .populate({
      path: 'modules',
      populate: {
        path: 'lessons',
        select: 'title order estimatedMinutes isEnriched'
      }
    });

  res.status(201).json({
    success: true,
    data: populatedCourse,
    message: 'Course generated successfully'
  });
});

/**
 * @desc    Get all courses for authenticated user
 * @route   GET /api/courses
 * @access  Private
 */
const getCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt', search } = req.query;

  // Build query
  let query = { creator: req.user.sub };

  // Add search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Execute query with pagination
  const courses = await Course.find(query)
    .populate({
      path: 'modules',
      select: 'title order lessonCount',
      populate: {
        path: 'lessons',
        select: 'title order isEnriched'
      }
    })
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  // Get total count for pagination
  const total = await Course.countDocuments(query);

  res.json({
    success: true,
    data: courses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Private
 */
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate({
      path: 'modules',
      populate: {
        path: 'lessons',
        select: 'title order estimatedMinutes isEnriched readingTime'
      }
    });

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found'
    });
  }

  // Check if user owns the course
  if (course.creator !== req.user.sub) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: course
  });
});

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private
 */
const updateCourse = asyncHandler(async (req, res) => {
  const { title, description, tags, difficulty, isPublic } = req.body;

  let course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found'
    });
  }

  // Check if user owns the course
  if (course.creator !== req.user.sub) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Update fields
  const updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (tags) updateData.tags = tags;
  if (difficulty) updateData.difficulty = difficulty;
  if (typeof isPublic === 'boolean') updateData.isPublic = isPublic;

  course = await Course.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate({
    path: 'modules',
    populate: {
      path: 'lessons',
      select: 'title order estimatedMinutes isEnriched'
    }
  });

  res.json({
    success: true,
    data: course,
    message: 'Course updated successfully'
  });
});

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found'
    });
  }

  // Check if user owns the course
  if (course.creator !== req.user.sub) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Delete associated modules and lessons
  const modules = await Module.find({ course: course._id });
  for (const module of modules) {
    await Lesson.deleteMany({ module: module._id });
    await module.remove();
  }

  await course.remove();

  res.json({
    success: true,
    data: {},
    message: 'Course deleted successfully'
  });
});

/**
 * @desc    Get course suggestions based on partial topic
 * @route   POST /api/courses/suggestions
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

  const suggestions = await aiService.generateCourseSuggestions(partialTopic.trim());

  res.json({
    success: true,
    data: suggestions
  });
});

/**
 * @desc    Get user's course statistics
 * @route   GET /api/courses/stats
 * @access  Private
 */
const getCourseStats = asyncHandler(async (req, res) => {
  const userId = req.user.sub;

  // Aggregate course statistics
  const stats = await Course.aggregate([
    { $match: { creator: userId } },
    {
      $lookup: {
        from: 'modules',
        localField: '_id',
        foreignField: 'course',
        as: 'modules'
      }
    },
    {
      $lookup: {
        from: 'lessons',
        localField: 'modules._id',
        foreignField: 'module',
        as: 'lessons'
      }
    },
    {
      $group: {
        _id: null,
        totalCourses: { $sum: 1 },
        totalModules: { $sum: { $size: '$modules' } },
        totalLessons: { $sum: { $size: '$lessons' } },
        totalEstimatedHours: { $sum: '$estimatedHours' },
        averageModulesPerCourse: { $avg: { $size: '$modules' } },
        difficultyDistribution: {
          $push: '$difficulty'
        }
      }
    }
  ]);

  const result = stats[0] || {
    totalCourses: 0,
    totalModules: 0,
    totalLessons: 0,
    totalEstimatedHours: 0,
    averageModulesPerCourse: 0,
    difficultyDistribution: []
  };

  // Process difficulty distribution
  const difficultyCount = result.difficultyDistribution.reduce((acc, difficulty) => {
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      ...result,
      difficultyDistribution: difficultyCount,
      averageModulesPerCourse: Math.round(result.averageModulesPerCourse * 10) / 10
    }
  });
});

module.exports = {
  generateCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getCourseSuggestions,
  getCourseStats
};
