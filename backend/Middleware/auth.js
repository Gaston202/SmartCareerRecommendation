const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const Admin = require('../Models/Admin');

/**
 * @desc    Authentication middleware - Verify JWT token
 * @usage   Protect routes that require authentication
 */
const isAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login to access this resource.'
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // Check if user or admin exists
    let user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      // Check if it's an admin
      user = await Admin.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.'
      });
    }

    // Attach user to request object
    req.user = user;
    req.userType = decoded.role ? 'admin' : 'user';
    
    next();
  } catch (error) {
    console.error('Error in isAuth middleware:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

/**
 * @desc    Authorization middleware - Check user roles
 * @usage   Restrict routes to specific roles
 * @param   {...string} roles - Allowed roles (e.g., 'ADMIN', 'SUPER_ADMIN')
 */
const isAutho = (...roles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Please authenticate first'
        });
      }

      // Check if user has admin role
      if (req.user.role) {
        // User is an admin - check role
        if (!roles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: `Access denied. Required role: ${roles.join(' or ')}`
          });
        }
      } else {
        // Regular user trying to access admin-only route
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      next();
    } catch (error) {
      console.error('Error in isAutho middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        error: error.message
      });
    }
  };
};

/**
 * @desc    Check if user is admin (any admin role)
 * @usage   Protect admin-only routes
 */
const isAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please authenticate first'
      });
    }

    // Check if user has admin role
    if (!req.user.role || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Authorization check failed',
      error: error.message
    });
  }
};

/**
 * @desc    Check if user owns the resource or is admin
 * @usage   Allow users to access their own data or admins to access any data
 */
const isOwnerOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Please authenticate first'
        });
      }

      // Get resource user ID from params or body
      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

      // Check if user is admin
      if (req.user.role && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
        return next();
      }

      // Check if user owns the resource
      if (req.user._id.toString() === resourceUserId) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    } catch (error) {
      console.error('Error in isOwnerOrAdmin middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        error: error.message
      });
    }
  };
};

module.exports = {
  isAuth,
  isAutho,
  isAdmin,
  isOwnerOrAdmin
};
