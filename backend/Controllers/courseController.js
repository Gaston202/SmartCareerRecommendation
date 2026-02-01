const Course = require('../Models/Course');

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private (Admin only)
 */
const createCourse = async (req, res) => {
  try {
    const { title, description, provider, duration, price, url, skillsTaught, difficulty } = req.body;

    // Validation
    if (!title || !provider || !url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide title, provider, and URL' 
      });
    }

    // Check if course already exists
    const existingCourse = await Course.findOne({ 
      title: { $regex: new RegExp(`^${title}$`, 'i') },
      provider 
    });
    
    if (existingCourse) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course already exists' 
      });
    }

    // Create course
    const course = await Course.create({
      title,
      description,
      provider,
      duration,
      price,
      url,
      skillsTaught,
      difficulty
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Error in createCourse:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
const getAllCourses = async (req, res) => {
  try {
    const { provider, difficulty, search = '', page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};
    if (provider) {
      query.provider = provider;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    const courses = await Course.find(query)
      .populate('skillsTaught', 'name category')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error in getAllCourses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private (Admin only)
 */
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, provider, duration, price, url, skillsTaught, difficulty } = req.body;

    // Find course
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (provider) course.provider = provider;
    if (duration) course.duration = duration;
    if (price !== undefined) course.price = price;
    if (url) course.url = url;
    if (skillsTaught) course.skillsTaught = skillsTaught;
    if (difficulty) course.difficulty = difficulty;

    await course.save();

    const updatedCourse = await Course.findById(id)
      .populate('skillsTaught', 'name category');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    console.error('Error in updateCourse:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private (Admin only)
 */
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  updateCourse,
  deleteCourse
};
