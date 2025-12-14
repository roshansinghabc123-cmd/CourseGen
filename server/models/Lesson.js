const mongoose = require('mongoose');

const headingBlockSchema = {
  type: { type: String, default: 'heading' },
  text: { type: String, required: true, trim: true },
  level: { type: Number, min: 1, max: 6, default: 2 }
};

const paragraphBlockSchema = {
  type: { type: String, default: 'paragraph' },
  text: { type: String, required: true, trim: true }
};

const codeBlockSchema = {
  type: { type: String, default: 'code' },
  language: { type: String, required: true, trim: true },
  text: { type: String, required: true },
  title: { type: String, trim: true }
};

const videoBlockSchema = {
  type: { type: String, default: 'video' },
  query: { type: String, required: true, trim: true },
  url: { type: String, trim: true },
  title: { type: String, trim: true },
  duration: { type: String, trim: true }
};

const mcqBlockSchema = {
  type: { type: String, default: 'mcq' },
  question: { type: String, required: true, trim: true },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  answer: { type: Number, required: true, min: 0 },
  explanation: { type: String, trim: true }
};

const listBlockSchema = {
  type: { type: String, default: 'list' },
  style: { type: String, enum: ['ordered', 'unordered'], default: 'unordered' },
  items: [{
    type: String,
    required: true,
    trim: true
  }]
};

const imageBlockSchema = {
  type: { type: String, default: 'image' },
  url: { type: String, required: true, trim: true },
  alt: { type: String, trim: true },
  caption: { type: String, trim: true }
};

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [200, 'Lesson title cannot exceed 200 characters']
  },
  content: {
    type: [mongoose.Schema.Types.Mixed],
    required: [true, 'Lesson content is required'],
    validate: {
      validator: function(content) {
        // Validate that content is an array and has at least one block
        return Array.isArray(content) && content.length > 0;
      },
      message: 'Lesson must have at least one content block'
    }
  },
  objectives: [{
    type: String,
    trim: true,
    maxlength: [200, 'Objective cannot exceed 200 characters']
  }],
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Lesson must belong to a module'],
    index: true
  },
  order: {
    type: Number,
    required: true,
    min: [0, 'Lesson order cannot be negative']
  },
  isEnriched: {
    type: Boolean,
    default: false
  },
  estimatedMinutes: {
    type: Number,
    min: [1, 'Estimated minutes must be at least 1'],
    max: [240, 'Estimated minutes cannot exceed 240 (4 hours)']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  hinglishAudio: {
    url: { type: String, trim: true },
    duration: { type: Number },
    isGenerated: { type: Boolean, default: false }
  },
  readingTime: {
    type: Number, // in minutes, calculated from content
    min: [1, 'Reading time must be at least 1 minute']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

lessonSchema.index({ module: 1, order: 1 });
lessonSchema.index({ module: 1, createdAt: -1 });
lessonSchema.index({ tags: 1 });
lessonSchema.index({ difficulty: 1 });

lessonSchema.virtual('contentBlockCount').get(function() {
  return this.content ? this.content.length : 0;
});

lessonSchema.virtual('hasVideo').get(function() {
  return this.content ? this.content.some(block => block.type === 'video') : false;
});

lessonSchema.virtual('hasQuiz').get(function() {
  return this.content ? this.content.some(block => block.type === 'mcq') : false;
});

lessonSchema.pre('save', function(next) {  if (this.isModified('content')) {
    let wordCount = 0;
    
    this.content.forEach(block => {
      if (block.type === 'paragraph' || block.type === 'heading') {
        wordCount += (block.text || '').split(/\s+/).length;
      } else if (block.type === 'mcq') {
        wordCount += (block.question || '').split(/\s+/).length;
        if (block.options) {
          block.options.forEach(option => {
            wordCount += option.split(/\s+/).length;
          });
        }
      } else if (block.type === 'list' && block.items) {
        block.items.forEach(item => {
          wordCount += item.split(/\s+/).length;
        });
      }
    });
    
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  next();
});

// Static method to find lessons by module
lessonSchema.statics.findByModule = function(moduleId, options = {}) {
  const query = this.find({ module: moduleId });
  
  // Always sort by order
  query.sort({ order: 1 });
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  return query;
};

// Instance method to get content by type
lessonSchema.methods.getContentByType = function(type) {
  return this.content.filter(block => block.type === type);
};

// Instance method to add content block
lessonSchema.methods.addContentBlock = function(block, position = -1) {
  if (position === -1 || position >= this.content.length) {
    this.content.push(block);
  } else {
    this.content.splice(position, 0, block);
  }
  return this.save();
};

// Instance method to remove content block
lessonSchema.methods.removeContentBlock = function(index) {
  if (index >= 0 && index < this.content.length) {
    this.content.splice(index, 1);
    return this.save();
  }
  throw new Error('Invalid content block index');
};

// Instance method to update content block
lessonSchema.methods.updateContentBlock = function(index, updatedBlock) {
  if (index >= 0 && index < this.content.length) {
    this.content[index] = { ...this.content[index], ...updatedBlock };
    return this.save();
  }
  throw new Error('Invalid content block index');
};

module.exports = mongoose.model('Lesson', lessonSchema);
