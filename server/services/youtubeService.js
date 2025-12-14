const axios = require('axios');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseURL = 'https://www.googleapis.com/youtube/v3';
    
    if (!this.apiKey) {
      console.warn('YOUTUBE_API_KEY not set. YouTube functionality will be limited.');
    }
  }

  /**
   * Search for educational videos based on a query
   * @param {string} query - Search query
   * @param {number} maxResults - Maximum number of results (default: 3)
   * @returns {Promise<Array>} - Array of video objects
   */
  async searchVideos(query, maxResults = 3) {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      const searchParams = {
        part: 'snippet',
        q: `${query} tutorial educational`,
        type: 'video',
        videoEmbeddable: 'true',
        videoCategoryId: '27', // Education category
        maxResults: Math.min(maxResults, 10), // API limit
        order: 'relevance',
        safeSearch: 'strict',
        key: this.apiKey
      };

      const response = await axios.get(`${this.baseURL}/search`, {
        params: searchParams,
        timeout: 10000 // 10 seconds timeout
      });

      const videos = response.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
        embedHtml: this.generateEmbedHtml(item.id.videoId, item.snippet.title)
      }));

      // Get additional video details for duration
      if (videos.length > 0) {
        return await this.enrichVideoDetails(videos);
      }

      return videos;
    } catch (error) {
      console.error('YouTube API Error:', error.message);
      
      if (error.response?.status === 403) {
        throw new Error('YouTube API quota exceeded or invalid API key');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid search query or parameters');
      } else {
        throw new Error(`YouTube search failed: ${error.message}`);
      }
    }
  }

  /**
   * Get detailed information about specific videos
   * @param {Array} videos - Array of basic video objects
   * @returns {Promise<Array>} - Array of enriched video objects
   */
  async enrichVideoDetails(videos) {
    if (!this.apiKey || videos.length === 0) {
      return videos;
    }

    try {
      const videoIds = videos.map(video => video.id).join(',');
      
      const response = await axios.get(`${this.baseURL}/videos`, {
        params: {
          part: 'contentDetails,statistics',
          id: videoIds,
          key: this.apiKey
        },
        timeout: 10000
      });

      const videoDetails = response.data.items.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      return videos.map(video => {
        const details = videoDetails[video.id];
        
        return {
          ...video,
          duration: details ? this.parseDuration(details.contentDetails.duration) : null,
          viewCount: details ? parseInt(details.statistics.viewCount) : 0,
          likeCount: details ? parseInt(details.statistics.likeCount || 0) : 0,
          isEducational: this.isEducationalContent(video)
        };
      });
    } catch (error) {
      console.error('Error enriching video details:', error.message);
      // Return original videos if enrichment fails
      return videos;
    }
  }

  /**
   * Generate embed HTML for a video
   * @param {string} videoId - YouTube video ID
   * @param {string} title - Video title for accessibility
   * @returns {string} - HTML embed code
   */
  generateEmbedHtml(videoId, title) {
    return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="${title.replace(/"/g, '&quot;')}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }

  /**
   * Parse ISO 8601 duration format (PT1H2M3S) to human readable
   * @param {string} duration - ISO 8601 duration
   * @returns {string} - Human readable duration
   */
  parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 'Unknown';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    let result = [];
    if (hours) result.push(`${hours}h`);
    if (minutes) result.push(`${minutes}m`);
    if (seconds && !hours) result.push(`${seconds}s`); // Only show seconds if no hours

    return result.join(' ') || '0s';
  }

  /**
   * Check if content appears to be educational based on title and channel
   * @param {Object} video - Video object
   * @returns {boolean} - Whether the content appears educational
   */
  isEducationalContent(video) {
    const educationalKeywords = [
      'tutorial', 'learn', 'course', 'lesson', 'guide', 'howto', 'explained',
      'introduction', 'basics', 'fundamentals', 'masterclass', 'workshop'
    ];

    const educationalChannels = [
      'khan academy', 'coursera', 'edx', 'udemy', 'codecademy', 'freecodecamp',
      'crash course', 'ted-ed', 'mit opencourseware', 'stanford'
    ];

    const title = video.title.toLowerCase();
    const channel = video.channelTitle.toLowerCase();

    const hasEducationalKeywords = educationalKeywords.some(keyword => 
      title.includes(keyword)
    );

    const isEducationalChannel = educationalChannels.some(channelName => 
      channel.includes(channelName)
    );

    return hasEducationalKeywords || isEducationalChannel;
  }

  /**
   * Get trending educational videos in a specific category
   * @param {string} categoryId - YouTube category ID (default: 27 for Education)
   * @param {number} maxResults - Maximum results
   * @returns {Promise<Array>} - Array of trending educational videos
   */
  async getTrendingEducationalVideos(categoryId = '27', maxResults = 10) {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseURL}/videos`, {
        params: {
          part: 'snippet,contentDetails,statistics',
          chart: 'mostPopular',
          videoCategoryId: categoryId,
          maxResults: Math.min(maxResults, 50),
          regionCode: 'US', // Can be made configurable
          key: this.apiKey
        },
        timeout: 10000
      });

      return response.data.items.map(item => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        duration: this.parseDuration(item.contentDetails.duration),
        viewCount: parseInt(item.statistics.viewCount),
        likeCount: parseInt(item.statistics.likeCount || 0),
        url: `https://www.youtube.com/watch?v=${item.id}`,
        embedUrl: `https://www.youtube.com/embed/${item.id}`,
        embedHtml: this.generateEmbedHtml(item.id, item.snippet.title)
      }));
    } catch (error) {
      console.error('Error fetching trending videos:', error.message);
      throw new Error(`Failed to fetch trending videos: ${error.message}`);
    }
  }

  /**
   * Validate video URL and extract video ID
   * @param {string} url - YouTube URL
   * @returns {Object} - Validation result with video ID
   */
  validateVideoUrl(url) {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          isValid: true,
          videoId: match[1],
          embedUrl: `https://www.youtube.com/embed/${match[1]}`,
          watchUrl: `https://www.youtube.com/watch?v=${match[1]}`
        };
      }
    }

    return {
      isValid: false,
      error: 'Invalid YouTube URL format'
    };
  }

  /**
   * Get video captions/subtitles if available
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<Array>} - Array of available captions
   */
  async getVideoCaptions(videoId) {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseURL}/captions`, {
        params: {
          part: 'snippet',
          videoId: videoId,
          key: this.apiKey
        },
        timeout: 10000
      });

      return response.data.items.map(item => ({
        id: item.id,
        language: item.snippet.language,
        name: item.snippet.name,
        trackKind: item.snippet.trackKind,
        isAutoGenerated: item.snippet.trackKind === 'asr'
      }));
    } catch (error) {
      console.error('Error fetching video captions:', error.message);
      return []; // Return empty array if captions can't be fetched
    }
  }
}

module.exports = new YouTubeService();
