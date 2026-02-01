const Admin = require('../Models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @desc    Create a new admin
 * @route   POST /api/admin/register
 * @access  Private (Super Admin only)
 */
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin with this email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'admin'
    });

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: adminResponse
    });
  } catch (error) {
    console.error('Error in createAdmin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Admin login
 * @route   POST /api/admin/login
 * @access  Public
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Find admin
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        admin: adminResponse,
        token
      }
    });
  } catch (error) {
    console.error('Error in loginAdmin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Get admin profile
 * @route   GET /api/admin/profile
 * @access  Private
 */
const getAdminProfile = async (req, res) => {
  try {
    // Assuming req.admin is set by auth middleware
    const admin = await Admin.findById(req.admin.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Error in getAdminProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Update admin
 * @route   PUT /api/admin/:id
 * @access  Private
 */
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    // Find admin
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    // Update fields
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (role) admin.role = role;

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: adminResponse
    });
  } catch (error) {
    console.error('Error in updateAdmin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Delete admin
 * @route   DELETE /api/admin/:id
 * @access  Private (Super Admin only)
 */
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    await Admin.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteAdmin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

module.exports = {
  createAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdmin,
  deleteAdmin
};
