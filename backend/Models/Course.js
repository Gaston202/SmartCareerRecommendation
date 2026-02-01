const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    provider: {
      type: String,
      required: [true, 'Provider is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
        message: '{VALUE} is not a valid difficulty level',
      },
      required: [true, 'Difficulty level is required'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for filtering by provider
courseSchema.index({ provider: 1 });

// Index for filtering by difficulty
courseSchema.index({ difficulty: 1 });

// Compound index for provider and difficulty
courseSchema.index({ provider: 1, difficulty: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
