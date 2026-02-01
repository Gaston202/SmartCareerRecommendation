const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Career title is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    level: {
      type: String,
      enum: {
        values: ['JUNIOR', 'MID', 'SENIOR'],
        message: '{VALUE} is not a valid career level',
      },
      required: [true, 'Career level is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for filtering by industry
careerSchema.index({ industry: 1 });

// Index for filtering by level
careerSchema.index({ level: 1 });

// Compound index for industry and level
careerSchema.index({ industry: 1, level: 1 });

const Career = mongoose.model('Career', careerSchema);

module.exports = Career;
