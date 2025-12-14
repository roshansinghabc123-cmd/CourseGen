const express = require('express');
const { query } = require('express-validator');
const youtubeService = require('../services/youtubeService');
const { asyncHandler } = require('../middlewares/errorHandler');
const { validationErrorHandler } = require('../middlewares/errorHandler');

const router = express.Router();

// Validation rules
const searchValidation = [
  query('query')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  query('maxResults')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Max results must be between 1 and 10')
];

const urlValidation = [
  query('url')
    .trim()
    .isURL()
    .withMessage('Valid YouTube URL is required')
];

/**
 * @desc    Search YouTube videos
 * @route   GET /api/youtube/search
 * @access  Public
 */
const searchVideos = asyncHandler(async (req, res) => {
  const { query, maxResults = 3 } = req.query;

  try {
    const videos = await youtubeService.searchVideos(query, parseInt(maxResults));

    res.json({
      success: true,
      data: videos,
      query: query
    });
  } catch (error) {
    console.error('YouTube search error:', error);
    
    if (error.message.includes('quota exceeded')) {
      return res.status(429).json({
        success: false,
        error: 'YouTube API quota exceeded. Please try again later.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to search YouTube videos'
    });
  }
});

/**
 * @desc    Get trending educational videos
 * @route   GET /api/youtube/trending
 * @access  Public
 */
const getTrendingVideos = asyncHandler(async (req, res) => {
  const { maxResults = 10 } = req.query;

  try {
    const videos = await youtubeService.getTrendingEducationalVideos('27', parseInt(maxResults));

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('YouTube trending error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending educational videos'
    });
  }
});

/**
 * @desc    Validate YouTube URL
 * @route   GET /api/youtube/validate
 * @access  Public
 */
const validateUrl = asyncHandler(async (req, res) => {
  const { url } = req.query;

  const validation = youtubeService.validateVideoUrl(url);

  res.json({
    success: true,
    data: validation
  });
});

/**
 * @desc    Get video captions
 * @route   GET /api/youtube/captions/:videoId
 * @access  Public
 */
const getVideoCaptions = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  try {
    const captions = await youtubeService.getVideoCaptions(videoId);

    res.json({
      success: true,
      data: captions
    });
  } catch (error) {
    console.error('YouTube captions error:', error);
    
    res.json({
      success: true,
      data: [],
      message: 'No captions available for this video'
    });
  }
});

/**
 * @desc    Get video embed HTML
 * @route   GET /api/youtube/embed/:videoId
 * @access  Public
 */
const getEmbedHtml = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title = 'Educational Video' } = req.query;

  const embedHtml = youtubeService.generateEmbedHtml(videoId, title);

  res.json({
    success: true,
    data: {
      videoId,
      embedHtml,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`
    }
  });
});

// Route definitions
router.get('/search', searchValidation, validationErrorHandler, searchVideos);
router.get('/trending', getTrendingVideos);
router.get('/validate', urlValidation, validationErrorHandler, validateUrl);
router.get('/captions/:videoId', getVideoCaptions);
router.get('/embed/:videoId', getEmbedHtml);

module.exports = router;
