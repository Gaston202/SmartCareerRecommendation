const Skill = require('../Models/Skill');

/**
 * @desc    Create a new skill
 * @route   POST /api/skills
 * @access  Private (Admin only)
 */
const createSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide skill name' 
      });
    }

    // Check if skill already exists
    const existingSkill = await Skill.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingSkill) {
      return res.status(400).json({ 
        success: false, 
        message: 'Skill already exists' 
      });
    }

    // Create skill
    const skill = await Skill.create({
      name,
      category,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: skill
    });
  } catch (error) {
    console.error('Error in createSkill:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Get all skills
 * @route   GET /api/skills
 * @access  Public
 */
const getAllSkills = async (req, res) => {
  try {
    const { category, search = '', page = 1, limit = 50 } = req.query;

    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Pagination
    const skip = (page - 1) * limit;
    const skills = await Skill.find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ name: 1 });

    const total = await Skill.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        skills,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error in getAllSkills:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Update skill
 * @route   PUT /api/skills/:id
 * @access  Private (Admin only)
 */
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description } = req.body;

    // Find skill
    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ 
        success: false, 
        message: 'Skill not found' 
      });
    }

    // Update fields
    if (name) skill.name = name;
    if (category) skill.category = category;
    if (description !== undefined) skill.description = description;

    await skill.save();

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: skill
    });
  } catch (error) {
    console.error('Error in updateSkill:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Delete skill
 * @route   DELETE /api/skills/:id
 * @access  Private (Admin only)
 */
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ 
        success: false, 
        message: 'Skill not found' 
      });
    }

    await Skill.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteSkill:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

module.exports = {
  createSkill,
  getAllSkills,
  updateSkill,
  deleteSkill
};
