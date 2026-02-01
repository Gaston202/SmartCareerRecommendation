const mongoose = require('mongoose');

const courseSkillSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate course-skill combinations
courseSkillSchema.index({ course: 1, skill: 1 }, { unique: true });

// Index for faster lookups by course
courseSkillSchema.index({ course: 1 });

// Index for faster lookups by skill
courseSkillSchema.index({ skill: 1 });

const CourseSkill = mongoose.model('CourseSkill', courseSkillSchema);

module.exports = CourseSkill;
