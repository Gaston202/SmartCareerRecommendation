const Career = require('../Models/Career');

/**
 * @desc    Create a new career
 * @route   POST /api/careers
 * @access  Private (Admin only)
 */
const createCareer = async (req, res) => {
  try {
    const { title, description, industry, averageSalary, requiredSkills, growthRate } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide title and description' 
      });
    }

    // Check if career already exists
    const existingCareer = await Career.findOne({ 
      title: { $regex: new RegExp(`^${title}$`, 'i') } 
    });
    
    if (existingCareer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Career with this title already exists' 
      });
    }

    // Create career
    const career = await Career.create({
      title,
      description,
      industry,
      averageSalary,
      requiredSkills,
      growthRate
    });

    res.status(201).json({
      success: true,
      message: 'Career created successfully',
      data: career
    });
  } catch (error) {
    console.error('Error in createCareer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Get all careers
 * @route   GET /api/careers
 * @access  Public
 */
const getAllCareers = async (req, res) => {
  try {
    const { industry, search = '', page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};
    if (industry) {
      query.industry = industry;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    const careers = await Career.find(query)
      .populate('requiredSkills', 'name category')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ title: 1 });

    const total = await Career.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        careers,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error in getAllCareers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Get career by ID
 * @route   GET /api/careers/:id
 * @access  Public
 */
const getCareerById = async (req, res) => {
  try {
    const { id } = req.params;

    const career = await Career.findById(id)
      .populate('requiredSkills', 'name category description');
    
    if (!career) {
      return res.status(404).json({ 
        success: false, 
        message: 'Career not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: career
    });
  } catch (error) {
    console.error('Error in getCareerById:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Update career
 * @route   PUT /api/careers/:id
 * @access  Private (Admin only)
 */
const updateCareer = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, industry, averageSalary, requiredSkills, growthRate } = req.body;

    // Find career
    const career = await Career.findById(id);
    if (!career) {
      return res.status(404).json({ 
        success: false, 
        message: 'Career not found' 
      });
    }

    // Update fields
    if (title) career.title = title;
    if (description) career.description = description;
    if (industry) career.industry = industry;
    if (averageSalary !== undefined) career.averageSalary = averageSalary;
    if (requiredSkills) career.requiredSkills = requiredSkills;
    if (growthRate !== undefined) career.growthRate = growthRate;

    await career.save();

    const updatedCareer = await Career.findById(id)
      .populate('requiredSkills', 'name category');

    res.status(200).json({
      success: true,
      message: 'Career updated successfully',
      data: updatedCareer
    });
  } catch (error) {
    console.error('Error in updateCareer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Delete career
 * @route   DELETE /api/careers/:id
 * @access  Private (Admin only)
 */
const deleteCareer = async (req, res) => {
  try {
    const { id } = req.params;

    const career = await Career.findById(id);
    if (!career) {
      return res.status(404).json({ 
        success: false, 
        message: 'Career not found' 
      });
    }

    await Career.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Career deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteCareer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

module.exports = {
  createCareer,
  getAllCareers,
  getCareerById,
  updateCareer,
  deleteCareer
};
