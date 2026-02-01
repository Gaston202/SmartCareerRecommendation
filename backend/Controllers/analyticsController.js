const Analytics = require('../Models/Analytics');
const User = require('../Models/User');
const Career = require('../Models/Career');
const Course = require('../Models/Course');
const Skill = require('../Models/Skill');
const Recommendation = require('../Models/Recommendation');

/**
 * @desc    Create analytics record
 * @route   POST /api/analytics
 * @access  Private
 */
const createAnalytics = async (req, res) => {
  try {
    const { userId, eventType, eventData, metadata } = req.body;

    // Validation
    if (!eventType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event type'
      });
    }

    // Create analytics record
    const analytics = await Analytics.create({
      userId,
      eventType,
      eventData,
      metadata,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Analytics record created successfully',
      data: analytics
    });
  } catch (error) {
    console.error('Error in createAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get analytics summary (dashboard stats)
 * @route   GET /api/analytics/summary
 * @access  Private (Admin only)
 */
const getAnalyticsSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get total counts
    const [
      totalUsers,
      totalCareers,
      totalCourses,
      totalSkills,
      totalRecommendations
    ] = await Promise.all([
      User.countDocuments(dateFilter),
      Career.countDocuments(dateFilter),
      Course.countDocuments(dateFilter),
      Skill.countDocuments(dateFilter),
      Recommendation.countDocuments(dateFilter)
    ]);

    // Get user growth trend (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top recommended careers
    const topCareers = await Recommendation.aggregate([
      {
        $group: {
          _id: '$careerId',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'careers',
          localField: '_id',
          foreignField: '_id',
          as: 'career'
        }
      },
      { $unwind: '$career' },
      {
        $project: {
          careerTitle: '$career.title',
          recommendationCount: '$count',
          averageScore: { $round: ['$avgScore', 2] }
        }
      }
    ]);

    // Get most popular skills
    const popularSkills = await Skill.aggregate([
      {
        $lookup: {
          from: 'userskills',
          localField: '_id',
          foreignField: 'skillId',
          as: 'users'
        }
      },
      {
        $project: {
          name: 1,
          category: 1,
          userCount: { $size: '$users' }
        }
      },
      { $sort: { userCount: -1 } },
      { $limit: 10 }
    ]);

    // Get analytics events summary
    const eventsSummary = await Analytics.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get user distribution by education level
    const educationDistribution = await User.aggregate([
      {
        $group: {
          _id: '$education',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get recommendations success rate
    const recommendationsStats = await Recommendation.aggregate([
      {
        $group: {
          _id: null,
          totalRecommendations: { $sum: 1 },
          avgScore: { $avg: '$score' },
          avgMatchPercentage: { $avg: '$matchPercentage' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCareers,
          totalCourses,
          totalSkills,
          totalRecommendations
        },
        trends: {
          userGrowth
        },
        topCareers,
        popularSkills,
        eventsSummary,
        educationDistribution,
        recommendationsStats: recommendationsStats[0] || {
          totalRecommendations: 0,
          avgScore: 0,
          avgMatchPercentage: 0
        }
      }
    });
  } catch (error) {
    console.error('Error in getAnalyticsSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get user activity analytics
 * @route   GET /api/analytics/user/:userId
 * @access  Private
 */
const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    const userActivities = await Analytics.find({ userId })
      .sort({ timestamp: -1 })
      .limit(50);

    const activitySummary = await Analytics.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          lastActivity: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        activities: userActivities,
        summary: activitySummary
      }
    });
  } catch (error) {
    console.error('Error in getUserAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createAnalytics,
  getAnalyticsSummary,
  getUserAnalytics
};
