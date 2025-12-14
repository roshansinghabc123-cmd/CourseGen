const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
    maxlength: [200, 'Module title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Module description cannot exceed 500 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Module must belong to a course'],
    index: true
  },
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  order: {
    type: Number,
    required: true,
    min: [0, 'Module order cannot be negative']
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [100, 'Estimated hours cannot exceed 100']
  },
  objectives: [{
    type: String,
    trim: true,
    maxlength: [200, 'Objective cannot exceed 200 characters']
  }],
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
moduleSchema.index({ course: 1, order: 1 });
moduleSchema.index({ course: 1, createdAt: -1 });

// Virtual for lesson count
moduleSchema.virtual('lessonCount').get(function() {
  return this.lessons ? this.lessons.length : 0;
});

// Pre-remove middleware to clean up associated lessons
moduleSchema.pre('remove', async function(next) {
  try {
    const Lesson = mongoose.model('Lesson');
    await Lesson.deleteMany({ module: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to find modules by course
moduleSchema.statics.findByCourse = function(courseId, options = {}) {
  const query = this.find({ course: courseId });
  
  if (options.populate) {
    query.populate('lessons');
  }
  
  // Always sort by order
  query.sort({ order: 1 });
  
  return query;
};

// Instance method to add lesson
moduleSchema.methods.addLesson = async function(lessonId) {
  if (!this.lessons.includes(lessonId)) {
    this.lessons.push(lessonId);
    await this.save();
  }
  return this;
};

// Instance method to remove lesson
moduleSchema.methods.removeLesson = async function(lessonId) {
  this.lessons = this.lessons.filter(id => !id.equals(lessonId));
  await this.save();
  return this;
};

// Instance method to reorder lessons
moduleSchema.methods.reorderLessons = async function(lessonIds) {
  // Validate that all provided IDs exist in the lessons array
  const validIds = lessonIds.filter(id => 
    this.lessons.some(lessonId => lessonId.equals(id))
  );
  
  if (validIds.length !== this.lessons.length) {
    throw new Error('Invalid lesson IDs provided for reordering');
  }
  
  this.lessons = validIds;
  await this.save();
  return this;
};

module.exports = mongoose.model('Module', moduleSchema);
