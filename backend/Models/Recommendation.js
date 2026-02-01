const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    career: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      required: [true, 'Career reference is required'],
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score must be at least 0'],
      max: [100, 'Score cannot exceed 100'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups by user
recommendationSchema.index({ user: 1 });

// Index for sorting by score
recommendationSchema.index({ score: -1 });

// Compound index for user and score (for getting top recommendations)
recommendationSchema.index({ user: 1, score: -1 });

// Compound index to prevent duplicate user-career recommendations
recommendationSchema.index({ user: 1, career: 1 }, { unique: true });

// Index for createdAt for time-based queries
recommendationSchema.index({ createdAt: -1 });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;
