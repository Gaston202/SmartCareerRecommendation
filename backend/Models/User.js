const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    // Authentication Fields
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    // Profile Fields
    educationLevel: {
      type: String,
      required: [true, 'Education level is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\d\s\-\+\(\)]+$/, 'Please provide a valid phone number'],
    },
    profilePicture: {
      type: String,
      trim: true,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    interests: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0,
      comment: 'Years of professional experience',
    },
    currentRole: {
      type: String,
      trim: true,
    },
    location: {
      city: String,
      country: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster email lookups
userSchema.index({ email: 1 });

// Index for filtering by education level
userSchema.index({ educationLevel: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
