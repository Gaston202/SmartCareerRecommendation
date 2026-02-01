const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill reference is required'],
    },
    level: {
      type: String,
      enum: {
        values: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
        message: '{VALUE} is not a valid skill level',
      },
      required: [true, 'Skill level is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate user-skill combinations
userSkillSchema.index({ user: 1, skill: 1 }, { unique: true });

// Index for faster lookups by user
userSkillSchema.index({ user: 1 });

// Index for filtering by skill level
userSkillSchema.index({ level: 1 });

const UserSkill = mongoose.model('UserSkill', userSkillSchema);

module.exports = UserSkill;
