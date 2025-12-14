const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Course description cannot exceed 1000 characters']
  },
  creator: {
    type: String,
    required: [true, 'Course creator is required'], // Auth0 sub
    index: true
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [1000, 'Estimated hours cannot exceed 1000']
  },
  enrollmentCount: {
    type: Number,
    default: 0,
    min: [0, 'Enrollment count cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
courseSchema.index({ creator: 1, createdAt: -1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ isPublic: 1, createdAt: -1 });
courseSchema.index({ title: 'text', description: 'text' });

// Virtual for module count
courseSchema.virtual('moduleCount').get(function() {
  return this.modules ? this.modules.length : 0;
});

// Pre-remove middleware to clean up associated modules
courseSchema.pre('remove', async function(next) {
  try {
    const Module = mongoose.model('Module');
    await Module.deleteMany({ course: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to find courses by creator
courseSchema.statics.findByCreator = function(creatorId, options = {}) {
  const query = this.find({ creator: creatorId });
  
  if (options.populate) {
    query.populate('modules');
  }
  
  if (options.sort) {
    query.sort(options.sort);
  } else {
    query.sort({ createdAt: -1 });
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  return query;
};

// Instance method to add module
courseSchema.methods.addModule = async function(moduleId) {
  if (!this.modules.includes(moduleId)) {
    this.modules.push(moduleId);
    await this.save();
  }
  return this;
};

// Instance method to remove module
courseSchema.methods.removeModule = async function(moduleId) {
  this.modules = this.modules.filter(id => !id.equals(moduleId));
  await this.save();
  return this;
};

module.exports = mongoose.model('Course', courseSchema);
