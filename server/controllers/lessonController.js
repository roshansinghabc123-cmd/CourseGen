const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const Course = require('../models/Course');
const aiService = require('../services/aiService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Get lesson by ID and generate content if needed
 * @route   GET /api/lessons/:id
 * @access  Private
 */
const getLesson = asyncHandler(async (req, res) => {
  let lesson = await Lesson.findById(req.params.id)
    .populate('module', 'title course')
    .populate({
      path: 'module',
      populate: {
        path: 'course',
        select: 'title creator'
      }
    });

  if (!lesson) {
    return res.status(404).json({
      success: false,
      error: 'Lesson not found'
    });
  }

  // Check if user owns the lesson (through course ownership)
  if (lesson.module.course.creator !== req.user.sub) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Generate content if lesson is not enriched
  if (!lesson.isEnriched) {
    try {
      const courseTitle = lesson.module.course.title;
      const moduleTitle = lesson.module.title;
      const lessonTitle = lesson.title;
      const lessonIndex = lesson.order;

      // Generate lesson content using AI
      const lessonData = await aiService.generateLesson(
        courseTitle,
        moduleTitle,
        lessonTitle,
        lessonIndex
      );

      // Update lesson with generated content
      lesson.content = lessonData.content;
      lesson.objectives = lessonData.objectives || [];
      lesson.estimatedMinutes = lessonData.estimatedMinutes || 15;
      lesson.isEnriched = true;

      await lesson.save();

      console.log(`Generated content for lesson: ${lessonTitle}`);
    } catch (error) {
      console.error('Error generating lesson content:', error);
      // Continue with existing content if generation fails
    }
  }

  res.json({
    success: true,
    data: lesson
  });
});

/**
 * @desc    Update lesson content
 * @route   PUT /api/lessons/:id
 * @access  Private
 */
const updateLesson = asyncHandler(async (req, res) => {
  const { title, content, objectives, estimatedMinutes, tags } = req.body;

  let lesson = await Lesson.findById(req.params.id)
    .populate({
      path: 'module',
      populate: {
        path: 'course',
        select: 'creator'
      }
    });

  if (!lesson) {
    return res.status(404).json({
      success: false,
      error: 'Lesson not found'
    });
  }

  // Check if user owns the lesson
  if (lesson.module.course.creator !== req.user.sub) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Update fields
  const updateData = {};
  if (title) updateData.title = title;
  if (content) updateData.content = content;
  if (objectives) updateData.objectives = objectives;
  if (estimatedMinutes) updateData.estimatedMinutes = estimatedMinutes;
  if (tags) updateData.tags = tags;

  lesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('module', 'title');

  res.json({
    success: true,
    data: lesson,
    message: 'Lesson updated successfully'
  });
});

/**
 * @desc    Delete lesson block by index
 * @route   DELETE /api/lessons/:id/blocks/:index
 * @access  Private
 */
const deleteContentBlock = asyncHandler(async (req, res) => {
  const { index } = req.params;
  const blockIndex = parseInt(index);

  let lesson = await Lesson.findById(req.params.id)
    .populate({
      path: 'module',
      populate: {
        path: 'course',
        select: 'creator'
      }
    });

  if (!lesson) {
    return res.status(404).json({
      success: false,
      error: 'Lesson not found'
    });
  }

  // Check if user owns the lesson
  if (lesson.module.course.creator !== req.user.sub) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  if (blockIndex < 0 || blockIndex >= lesson.content.length) {
    return res.status(400).json({
      success: false,
      error: 'Invalid content block index'
    });
  }

  // Remove the content block
  lesson.content.splice(blockIndex, 1);
  await lesson.save();

  res.json({
    success: true,
    data: lesson,
    message: 'Content block deleted successfully'
  });
});

/**
 * @desc    Add new content block to lesson
 * @route   POST /api/lessons/:id/blocks
 * @access  Private
 */
const addContentBlock = asyncHandler(async (req, res) => {
  const { block, position = -1 } = req.body;

  let lesson = await Lesson.findById(req.params.id)
    .populate({
      path: 'module',
      populate: {
        path: 'course',
        select: 'creator'
      }
    });

  if (!lesson) {
    return res.status(404).json({
      success: false,
      error: 'Lesson not found'
    });
  }

  // Check if user owns the lesson
  if (lesson.module.course.creator !== req.user.sub) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  if (!block || !block.type) {
    return res.status(400).json({
      success: false,
      error: 'Block must have a type'
    });
  }

  // Validate block type
  const validTypes = ['heading', 'paragraph', 'code', 'list', 'video', 'mcq', 'image'];
  if (!validTypes.includes(block.type)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid block type'
    });
  }

  // Add the content block
  if (position === -1 || position >= lesson.content.length) {
    lesson.content.push(block);
  } else {
    lesson.content.splice(position, 0, block);
  }

  await lesson.save();

  res.json({
    success: true,
    data: lesson,
    message: 'Content block added successfully'
  });
});

/**
 * @desc    Update specific content block
 * @route   PUT /api/lessons/:id/blocks/:index
 * @access  Private
 */
const updateContentBlock = asyncHandler(async (req, res) => {
  const { index } = req.params;
  const { block } = req.body;
  const blockIndex = parseInt(index);

  let lesson = await Lesson.findById(req.params.id)
    .populate({
      path: 'module',
      populate: {
        path: 'course',
        select: 'creator'
      }
    });

  if (!lesson) {
    return res.status(404).json({
      success: false,
      error: 'Lesson not found'
    });
  }

  // Check if user owns the lesson
  if (lesson.module.course.creator !== req.user.sub) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  if (blockIndex < 0 || blockIndex >= lesson.content.length) {
    return res.status(400).json({
      success: false,
      error: 'Invalid content block index'
    });
  }

  if (!block) {
    return res.status(400).json({
      success: false,
      error: 'Block data is required'
    });
  }

  // Update the content block
  lesson.content[blockIndex] = { ...lesson.content[blockIndex], ...block };
  await lesson.save();

  res.json({
    success: true,
    data: lesson,
    message: 'Content block updated successfully'
  });
});

/**
 * @desc    Generate Hinglish audio for lesson
 * @route   POST /api/lessons/:id/audio/hinglish
 * @access  Private
 */
const generateHinglishAudio = asyncHandler(async (req, res) => {
  let lesson = await Lesson.findById(req.params.id)
    .populate({
      path: 'module',
      populate: {
        path: 'course',
        select: 'creator'
      }
    });

  if (!lesson) {
    return res.status(404).json({
      success: false,
      error: 'Lesson not found'
    });
  }

  // Check if user owns the lesson
  if (lesson.module.course.creator !== req.user.sub) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  try {
    // Extract text content from lesson
    const textContent = lesson.content
      .filter(block => ['paragraph', 'heading'].includes(block.type))
      .map(block => block.text)
      .join(' ');

    if (!textContent.trim()) {
      return res.status(400).json({
        success: false,
        error: 'No text content found to convert to audio'
      });
    }

    // Translate to Hinglish
    const hinglishText = await aiService.translateToHinglish(textContent);

    // For now, we'll just return the translated text
    // In a full implementation, you would use a TTS service to generate actual audio
    lesson.hinglishAudio = {
      url: null, // Would be the URL to the generated audio file
      duration: null,
      isGenerated: false,
      text: hinglishText // Store the translated text for now
    };

    await lesson.save();

    res.json({
      success: true,
      data: {
        hinglishText,
        message: 'Hinglish translation generated successfully'
      }
    });
  } catch (error) {
    console.error('Error generating Hinglish audio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Hinglish audio'
    });
  }
});

/**
 * @desc    Get lesson progress/analytics
 * @route   GET /api/lessons/:id/analytics
 * @access  Private
 */
const getLessonAnalytics = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id)
    .populate({
      path: 'module',
      populate: {
        path: 'course',
        select: 'creator'
      }
    });

  if (!lesson) {
    return res.status(404).json({
      success: false,
      error: 'Lesson not found'
    });
  }

  // Check if user owns the lesson
  if (lesson.module.course.creator !== req.user.sub) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Calculate analytics
  const analytics = {
    contentBlockCount: lesson.content.length,
    contentTypeDistribution: {},
    hasVideo: lesson.content.some(block => block.type === 'video'),
    hasQuiz: lesson.content.some(block => block.type === 'mcq'),
    hasCode: lesson.content.some(block => block.type === 'code'),
    estimatedReadingTime: lesson.readingTime,
    wordCount: 0,
    codeBlockCount: 0,
    quizQuestionCount: 0
  };

  // Calculate content type distribution and other metrics
  lesson.content.forEach(block => {
    analytics.contentTypeDistribution[block.type] = 
      (analytics.contentTypeDistribution[block.type] || 0) + 1;

    if (block.type === 'paragraph' || block.type === 'heading') {
      analytics.wordCount += (block.text || '').split(/\s+/).length;
    } else if (block.type === 'code') {
      analytics.codeBlockCount++;
    } else if (block.type === 'mcq') {
      analytics.quizQuestionCount++;
    }
  });

  res.json({
    success: true,
    data: analytics
  });
});

module.exports = {
  getLesson,
  updateLesson,
  deleteContentBlock,
  addContentBlock,
  updateContentBlock,
  generateHinglishAudio,
  getLessonAnalytics
};
