const UserSkill = require('../Models/UserSkill');
const User = require('../Models/User');
const Skill = require('../Models/Skill');

/**
 * @desc    Add skill to user profile
 * @route   POST /api/user-skills
 * @access  Private
 */
const addUserSkill = async (req, res) => {
  try {
    const { user, skill, level } = req.body;

    // Validation
    if (!user || !skill || !level) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user, skill, and level'
      });
    }

    // Verify user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify skill exists
    const skillExists = await Skill.findById(skill);
    if (!skillExists) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if user-skill combination already exists
    const existingUserSkill = await UserSkill.findOne({ user, skill });
    if (existingUserSkill) {
      return res.status(400).json({
        success: false,
        message: 'User already has this skill. Use update endpoint to modify level.'
      });
    }

    // Create user skill
    const userSkill = await UserSkill.create({
      user,
      skill,
      level
    });

    // Populate and return
    const populatedUserSkill = await UserSkill.findById(userSkill._id)
      .populate('user', 'name email')
      .populate('skill', 'name category');

    res.status(201).json({
      success: true,
      message: 'Skill added to user profile successfully',
      data: populatedUserSkill
    });
  } catch (error) {
    console.error('Error in addUserSkill:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get all skills for a specific user
 * @route   GET /api/user-skills/user/:userId
 * @access  Private
 */
const getUserSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    const { level } = req.query;

    // Build query
    const query = { user: userId };
    if (level) {
      query.level = level.toUpperCase();
    }

    const userSkills = await UserSkill.find(query)
      .populate('skill', 'name category description')
      .sort({ createdAt: -1 });

    // Group skills by level for better organization
    const skillsByLevel = {
      BEGINNER: [],
      INTERMEDIATE: [],
      ADVANCED: []
    };

    userSkills.forEach(us => {
      if (skillsByLevel[us.level]) {
        skillsByLevel[us.level].push(us);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        allSkills: userSkills,
        byLevel: skillsByLevel,
        total: userSkills.length
      }
    });
  } catch (error) {
    console.error('Error in getUserSkills:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get all users who have a specific skill
 * @route   GET /api/user-skills/skill/:skillId
 * @access  Private (Admin only)
 */
const getUsersBySkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { level } = req.query;

    // Build query
    const query = { skill: skillId };
    if (level) {
      query.level = level.toUpperCase();
    }

    const userSkills = await UserSkill.find(query)
      .populate('user', 'name email education experience')
      .populate('skill', 'name category')
      .sort({ level: -1, createdAt: -1 });

    // Count by level
    const levelCounts = {
      BEGINNER: 0,
      INTERMEDIATE: 0,
      ADVANCED: 0
    };

    userSkills.forEach(us => {
      if (levelCounts[us.level] !== undefined) {
        levelCounts[us.level]++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        users: userSkills,
        statistics: {
          total: userSkills.length,
          byLevel: levelCounts
        }
      }
    });
  } catch (error) {
    console.error('Error in getUsersBySkill:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Update user skill level
 * @route   PUT /api/user-skills/:id
 * @access  Private
 */
const updateUserSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { level } = req.body;

    // Validation
    if (!level) {
      return res.status(400).json({
        success: false,
        message: 'Please provide skill level'
      });
    }

    // Validate level value
    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
    if (!validLevels.includes(level.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill level. Must be BEGINNER, INTERMEDIATE, or ADVANCED'
      });
    }

    // Find and update
    const userSkill = await UserSkill.findById(id);
    if (!userSkill) {
      return res.status(404).json({
        success: false,
        message: 'User skill not found'
      });
    }

    userSkill.level = level.toUpperCase();
    await userSkill.save();

    // Populate and return
    const updatedUserSkill = await UserSkill.findById(id)
      .populate('user', 'name email')
      .populate('skill', 'name category');

    res.status(200).json({
      success: true,
      message: 'Skill level updated successfully',
      data: updatedUserSkill
    });
  } catch (error) {
    console.error('Error in updateUserSkill:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Delete user skill
 * @route   DELETE /api/user-skills/:id
 * @access  Private
 */
const deleteUserSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const userSkill = await UserSkill.findById(id);
    if (!userSkill) {
      return res.status(404).json({
        success: false,
        message: 'User skill not found'
      });
    }

    await UserSkill.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Skill removed from user profile successfully'
    });
  } catch (error) {
    console.error('Error in deleteUserSkill:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk add skills to user
 * @route   POST /api/user-skills/bulk
 * @access  Private
 */
const bulkAddUserSkills = async (req, res) => {
  try {
    const { userId, skills } = req.body;

    // Validation
    if (!userId || !skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and an array of skills'
      });
    }

    // Verify user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const results = {
      added: [],
      skipped: [],
      errors: []
    };

    // Process each skill
    for (const skillData of skills) {
      try {
        const { skillId, level } = skillData;

        // Check if skill exists
        const skillExists = await Skill.findById(skillId);
        if (!skillExists) {
          results.errors.push({
            skillId,
            reason: 'Skill not found'
          });
          continue;
        }

        // Check if already exists
        const existing = await UserSkill.findOne({ user: userId, skill: skillId });
        if (existing) {
          results.skipped.push({
            skillId,
            skillName: skillExists.name,
            reason: 'Already exists'
          });
          continue;
        }

        // Create user skill
        const userSkill = await UserSkill.create({
          user: userId,
          skill: skillId,
          level: level || 'BEGINNER'
        });

        results.added.push({
          id: userSkill._id,
          skillId,
          skillName: skillExists.name,
          level: userSkill.level
        });
      } catch (err) {
        results.errors.push({
          skillId: skillData.skillId,
          reason: err.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk operation completed',
      data: results
    });
  } catch (error) {
    console.error('Error in bulkAddUserSkills:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get skill gap analysis for a user and target career
 * @route   GET /api/user-skills/gap-analysis/:userId/:careerId
 * @access  Private
 */
const getSkillGapAnalysis = async (req, res) => {
  try {
    const { userId, careerId } = req.params;

    // Get user's current skills
    const userSkills = await UserSkill.find({ user: userId })
      .populate('skill', 'name category');

    const userSkillIds = userSkills.map(us => us.skill._id.toString());

    // Get career required skills
    const Career = require('../Models/Career');
    const career = await Career.findById(careerId)
      .populate('requiredSkills', 'name category');

    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Career not found'
      });
    }

    // Analyze skill gaps
    const hasSkills = [];
    const missingSkills = [];

    career.requiredSkills.forEach(reqSkill => {
      const hasSkill = userSkillIds.includes(reqSkill._id.toString());
      
      if (hasSkill) {
        const userSkillData = userSkills.find(
          us => us.skill._id.toString() === reqSkill._id.toString()
        );
        hasSkills.push({
          skill: reqSkill,
          level: userSkillData.level
        });
      } else {
        missingSkills.push(reqSkill);
      }
    });

    // Calculate readiness percentage
    const readinessPercentage = career.requiredSkills.length > 0
      ? Math.round((hasSkills.length / career.requiredSkills.length) * 100)
      : 0;

    // Get suggested courses for missing skills
    const Course = require('../Models/Course');
    const suggestedCourses = await Course.find({
      skillsTaught: { $in: missingSkills.map(s => s._id) }
    })
      .populate('skillsTaught', 'name category')
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        career: {
          id: career._id,
          title: career.title
        },
        readinessPercentage,
        hasSkills,
        missingSkills,
        suggestedCourses
      }
    });
  } catch (error) {
    console.error('Error in getSkillGapAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  addUserSkill,
  getUserSkills,
  getUsersBySkill,
  updateUserSkill,
  deleteUserSkill,
  bulkAddUserSkills,
  getSkillGapAnalysis
};
