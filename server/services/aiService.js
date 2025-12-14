const { GoogleGenAI } = require('@google/genai');

class AIService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    // Initialize new SDK
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Default Model
    this.modelName = 'gemini-2.5-flash';

    // Configuration for text generation
    this.generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    };
  }

  /**
   * Helper to safely extract text from response
   */
  extractText(response) {
    if (response.text && typeof response.text === 'function') {
      return response.text();
    }
    if (typeof response.text === 'string') {
      return response.text;
    }
    // Fallback to deep extraction
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      return response.candidates[0].content.parts[0].text;
    }
    throw new Error('Could not extract text from AI response');
  }

  /**
   * Generate course outline from a topic
   * @param {string} topic - The course topic
   * @returns {Promise<Object>} - Course outline with modules and lessons
   */
  async generateCourse(topic) {
    const prompt = this.buildCoursePrompt(topic);

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: this.generationConfig,
      });

      const text = this.extractText(response);
      const courseData = this.parseJSONResponse(text);
      this.validateCourseStructure(courseData);
      return courseData;

    } catch (error) {
      console.error('Error generating course:', error);
      throw new Error(`Failed to generate course: ${error.message}`);
    }
  }

  /**
   * Generate detailed lesson content
   * @param {string} courseTitle - The course title
   * @param {string} moduleTitle - The module title
   * @param {string} lessonTitle - The lesson title
   * @param {number} lessonIndex - The lesson index in the module
   * @returns {Promise<Object>} - Detailed lesson content
   */
  async generateLesson(courseTitle, moduleTitle, lessonTitle, lessonIndex = 0) {
    const prompt = this.buildLessonPrompt(courseTitle, moduleTitle, lessonTitle, lessonIndex);

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: this.generationConfig,
      });

      const text = this.extractText(response);
      const lessonData = this.parseJSONResponse(text);
      this.validateLessonStructure(lessonData);
      return lessonData;

    } catch (error) {
      console.error('Error generating lesson:', error);
      throw new Error(`Failed to generate lesson: ${error.message}`);
    }
  }

  /**
   * Translate text to Hinglish
   * @param {string} text - Text to translate
   * @returns {Promise<string>} - Translated text
   */
  async translateToHinglish(text) {
    const prompt = `
Translate the following English text to Hinglish (Hindi-English mix that's commonly used in India). 
Make it conversational and easy to understand for someone who knows both Hindi and English.
Keep technical terms in English but explain concepts in a mix of Hindi and English.

Text to translate:
"${text}"

Return only the translated text, no extra formatting or explanations.
`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { ...this.generationConfig, temperature: 0.5 },
      });

      return this.extractText(response).trim();
    } catch (error) {
      console.error('Error translating to Hinglish:', error);
      throw new Error(`Failed to translate text: ${error.message}`);
    }
  }

  /**
   * Generate course suggestions based on a partial topic
   * @param {string} partialTopic - Partial topic input
   * @returns {Promise<Array>} - Array of suggested topics
   */
  async generateCourseSuggestions(partialTopic) {
    const prompt = `
Based on the partial topic "${partialTopic}", suggest 5 specific, engaging course topics that someone might want to learn about.

Return ONLY a valid JSON array of strings like this:
["Specific Course Topic 1", "Specific Course Topic 2", "Specific Course Topic 3", "Specific Course Topic 4", "Specific Course Topic 5"]

Make suggestions specific, practical, and beginner-friendly.
`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { ...this.generationConfig, temperature: 0.8 },
      });

      const text = this.extractText(response);
      return this.parseJSONResponse(text);
    } catch (error) {
      console.error('Error generating course suggestions:', error);
      return []; // Return empty array on error
    }
  }

  // --- Private Helpers ---

  buildCoursePrompt(topic) {
    return `
You are an expert course creator. Generate a comprehensive course outline for the topic: "${topic}"

Create a structured course with the following requirements:
1. Course should have 4-6 modules
2. Each module should have 3-5 lessons
3. Progress from basic to advanced concepts
4. Include practical applications where relevant

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Course Title",
  "description": "Brief course description (2-3 sentences)",
  "difficulty": "beginner|intermediate|advanced",
  "estimatedHours": 15,
  "tags": ["tag1", "tag2", "tag3"],
  "modules": [
    {
      "title": "Module Title",
      "description": "Module description",
      "order": 0,
      "lessons": [
        {
          "title": "Lesson Title",
          "order": 0
        }
      ]
    }
  ]
}

Important: Return ONLY the JSON object, no markdown formatting, no explanations, no additional text.
`;
  }

  buildLessonPrompt(courseTitle, moduleTitle, lessonTitle, lessonIndex) {
    return `
You are an expert content creator. Generate detailed lesson content for:
Course: "${courseTitle}"
Module: "${moduleTitle}"
Lesson: "${lessonTitle}"
Lesson Position: ${lessonIndex + 1}

Create comprehensive lesson content with the following structure:
1. Clear learning objectives (2-3 objectives)
2. Mixed content blocks: headings, paragraphs, code examples (if relevant), lists
3. One video search query for supplementary content
4. 3-4 multiple choice questions at the end
5. Ensure content is engaging and educational

Return ONLY a valid JSON object with this exact structure:
{
  "title": "${lessonTitle}",
  "objectives": [
    "Learn about...",
    "Understand how to..."
  ],
  "estimatedMinutes": 15,
  "content": [
    {
      "type": "heading",
      "text": "Introduction",
      "level": 2
    },
    {
      "type": "paragraph",
      "text": "Detailed explanation..."
    },
    {
      "type": "code",
      "language": "javascript",
      "text": "console.log('Hello World');",
      "title": "Basic Example"
    },
    {
      "type": "list",
      "style": "unordered",
      "items": ["Point 1", "Point 2"]
    },
    {
      "type": "video",
      "query": "Search query for relevant video"
    },
    {
      "type": "mcq",
      "question": "What is...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 1,
      "explanation": "The correct answer is B because..."
    }
  ]
}

Important: 
- Include code blocks only if relevant to the topic
- Make video queries specific and educational
- Ensure MCQ questions test understanding of the lesson content
- Return ONLY the JSON object, no markdown formatting, no explanations
`;
  }

  parseJSONResponse(text) {
    try {
      // Clean the response text
      let cleanText = text.trim();

      // Remove markdown code block formatting if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Parse JSON
      return JSON.parse(cleanText);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', text);
      throw new Error('AI returned invalid JSON format');
    }
  }

  validateCourseStructure(courseData) {
    const required = ['title', 'description', 'modules'];
    const missing = required.filter(field => !courseData[field]);

    if (missing.length > 0) {
      throw new Error(`Course data missing required fields: ${missing.join(', ')}`);
    }

    if (!Array.isArray(courseData.modules) || courseData.modules.length === 0) {
      throw new Error('Course must have at least one module');
    }

    courseData.modules.forEach((module, index) => {
      if (!module.title) {
        throw new Error(`Module ${index} missing title`);
      }
      if (!Array.isArray(module.lessons) || module.lessons.length === 0) {
        throw new Error(`Module "${module.title}" must have at least one lesson`);
      }
    });
  }

  validateLessonStructure(lessonData) {
    const required = ['title', 'content'];
    const missing = required.filter(field => !lessonData[field]);

    if (missing.length > 0) {
      throw new Error(`Lesson data missing required fields: ${missing.join(', ')}`);
    }

    if (!Array.isArray(lessonData.content) || lessonData.content.length === 0) {
      throw new Error('Lesson must have at least one content block');
    }

    // Validate content blocks
    lessonData.content.forEach((block, index) => {
      if (!block.type) {
        throw new Error(`Content block ${index} missing type`);
      }

      const validTypes = ['heading', 'paragraph', 'code', 'list', 'video', 'mcq', 'image'];
      if (!validTypes.includes(block.type)) {
        throw new Error(`Invalid content block type: ${block.type}`);
      }
    });
  }
}

module.exports = new AIService();
