const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    metricType: {
      type: String,
      required: [true, 'Metric type is required'],
      trim: true,
    },
    value: {
      type: Number,
      required: [true, 'Value is required'],
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for filtering by metric type
analyticsSchema.index({ metricType: 1 });

// Index for time-based queries
analyticsSchema.index({ recordedAt: -1 });

// Compound index for metric type and recorded date
analyticsSchema.index({ metricType: 1, recordedAt: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;
