const mongoose = require('mongoose');

const careerSkillSchema = new mongoose.Schema(
  {
    career: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      required: [true, 'Career reference is required'],
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill reference is required'],
    },
    importanceLevel: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH'],
        message: '{VALUE} is not a valid importance level',
      },
      required: [true, 'Importance level is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate career-skill combinations
careerSkillSchema.index({ career: 1, skill: 1 }, { unique: true });

// Index for faster lookups by career
careerSkillSchema.index({ career: 1 });

// Index for filtering by importance level
careerSkillSchema.index({ importanceLevel: 1 });

const CareerSkill = mongoose.model('CareerSkill', careerSkillSchema);

module.exports = CareerSkill;
