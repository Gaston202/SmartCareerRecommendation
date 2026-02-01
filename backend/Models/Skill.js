const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups by name
skillSchema.index({ name: 1 });

// Index for filtering by category
skillSchema.index({ category: 1 });

// Compound index for category and name
skillSchema.index({ category: 1, name: 1 });

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;
