const Recommendation = require('../Models/Recommendation');
const UserSkill = require('../Models/UserSkill');
const Career = require('../Models/Career');
const CareerSkill = require('../Models/CareerSkill');
const Course = require('../Models/Course');

/**
 * @desc    Generate career recommendations for a user
 * @route   POST /api/recommendations/generate/:userId
 * @access  Private
 */
const generateRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 5 } = req.body;

    // Step 1: Fetch user skills with proficiency levels
    const userSkills = await UserSkill.find({ userId })
      .populate('skillId', 'name category');

    if (!userSkills || userSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User has no skills registered. Please add skills first.'
      });
    }

    // Create a map of user skills with proficiency
    const userSkillMap = new Map();
    userSkills.forEach(us => {
      if (us.skillId && us.skillId._id) {
        userSkillMap.set(us.skillId._id.toString(), us.proficiencyLevel || 1);
      }
    });

    // Step 2: Fetch all careers with their required skills
    const careers = await Career.find().populate('requiredSkills', 'name category');

    // Step 3: Calculate match scores for each career
    const careerScores = [];

    for (const career of careers) {
      if (!career.requiredSkills || career.requiredSkills.length === 0) {
        continue;
      }

      let matchedSkills = 0;
      let totalSkillScore = 0;

      // Check each required skill
      career.requiredSkills.forEach(skill => {
        if (skill && skill._id) {
          const skillId = skill._id.toString();
          if (userSkillMap.has(skillId)) {
            matchedSkills++;
            totalSkillScore += userSkillMap.get(skillId);
          }
        }
      });

      // Calculate match percentage
      const matchPercentage = (matchedSkills / career.requiredSkills.length) * 100;

      // Calculate weighted score (based on match percentage and proficiency)
      const averageProficiency = matchedSkills > 0 ? totalSkillScore / matchedSkills : 0;
      const score = (matchPercentage * 0.7) + (averageProficiency * 10 * 0.3);

      if (matchPercentage > 0) {
        careerScores.push({
          careerId: career._id,
          careerTitle: career.title,
          matchPercentage: Math.round(matchPercentage),
          score: Math.round(score * 100) / 100,
          matchedSkills,
          totalRequiredSkills: career.requiredSkills.length
        });
      }
    }

    // Sort by score (highest first)
    careerScores.sort((a, b) => b.score - a.score);

    // Limit results
    const topRecommendations = careerScores.slice(0, parseInt(limit));

    if (topRecommendations.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No career recommendations found based on current skills',
        data: []
      });
    }

    // Step 4: Save recommendations to database
    // Delete old recommendations for this user
    await Recommendation.deleteMany({ userId });

    const recommendationDocs = topRecommendations.map(rec => ({
      userId,
      careerId: rec.careerId,
      score: rec.score,
      matchPercentage: rec.matchPercentage,
      reason: `Matched ${rec.matchedSkills} out of ${rec.totalRequiredSkills} required skills`
    }));

    const savedRecommendations = await Recommendation.insertMany(recommendationDocs);

    // Step 5: Fetch full recommendation details with career info
    const fullRecommendations = await Recommendation.find({ userId })
      .populate({
        path: 'careerId',
        select: 'title description industry averageSalary requiredSkills growthRate',
        populate: {
          path: 'requiredSkills',
          select: 'name category'
        }
      })
      .sort({ score: -1 });

    res.status(200).json({
      success: true,
      message: 'Career recommendations generated successfully',
      data: fullRecommendations
    });
  } catch (error) {
    console.error('Error in generateRecommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get recommendations by user
 * @route   GET /api/recommendations/user/:userId
 * @access  Private
 */
const getRecommendationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const recommendations = await Recommendation.find({ userId })
      .populate({
        path: 'careerId',
        select: 'title description industry averageSalary requiredSkills growthRate',
        populate: {
          path: 'requiredSkills',
          select: 'name category'
        }
      })
      .sort({ score: -1 });

    if (!recommendations || recommendations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No recommendations found for this user'
      });
    }

    // Optionally fetch suggested courses for missing skills
    const enhancedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        const recObj = rec.toObject();
        
        // Find courses that teach the required skills
        if (rec.careerId && rec.careerId.requiredSkills) {
          const skillIds = rec.careerId.requiredSkills.map(s => s._id);
          const suggestedCourses = await Course.find({
            skillsTaught: { $in: skillIds }
          })
            .select('title provider url difficulty skillsTaught')
            .populate('skillsTaught', 'name')
            .limit(3);

          recObj.suggestedCourses = suggestedCourses;
        }

        return recObj;
      })
    );

    res.status(200).json({
      success: true,
      data: enhancedRecommendations
    });
  } catch (error) {
    console.error('Error in getRecommendationsByUser:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Delete recommendation
 * @route   DELETE /api/recommendations/:id
 * @access  Private
 */
const deleteRecommendation = async (req, res) => {
  try {
    const { id } = req.params;

    const recommendation = await Recommendation.findById(id);
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    await Recommendation.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Recommendation deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteRecommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  generateRecommendations,
  getRecommendationsByUser,
  deleteRecommendation
};
