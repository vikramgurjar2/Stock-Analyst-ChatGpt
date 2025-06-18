const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('assignedAnalyst', 'firstName lastName email')
      .populate('assignedInvestors', 'firstName lastName email');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, profilePicture } = req.body;
    const updateData = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (profilePicture) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get all users with role-based filtering
router.get('/all', auth, async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };
    
    if (role && ['analyst', 'investor'].includes(role)) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('assignedAnalyst', 'firstName lastName email')
      .populate('assignedInvestors', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('assignedAnalyst', 'firstName lastName email')
      .populate('assignedInvestors', 'firstName lastName email');

    if (!user || !user.isActive) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if user can access this profile
    const canAccess = (
      req.user.userId === user._id.toString() || // Own profile
      (user.assignedAnalyst && user.assignedAnalyst._id.toString() === req.user.userId) || // Assigned analyst
      (user.assignedInvestors && user.assignedInvestors.some(inv => inv._id.toString() === req.user.userId)) // Assigned investor
    );

    if (!canAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Assign analyst to investor
router.post('/assign-analyst', [
  auth,
  authorize('analyst'), // Only analysts can assign themselves or be assigned
  body('investorId').isMongoId().withMessage('Valid investor ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { investorId } = req.body;
    const analystId = req.user.userId; // Current user (analyst)

    // Verify investor exists and is an investor
    const investor = await User.findById(investorId);
    if (!investor || investor.role !== 'investor' || !investor.isActive) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid investor' 
      });
    }

    // Check if investor already has an analyst
    if (investor.assignedAnalyst) {
      return res.status(400).json({ 
        success: false,
        message: 'Investor already has an assigned analyst' 
      });
    }

    // Update investor with assigned analyst
    investor.assignedAnalyst = analystId;
    await investor.save();

    // Add investor to analyst's assigned investors
    const analyst = await User.findById(analystId);
    if (!analyst.assignedInvestors.includes(investorId)) {
      analyst.assignedInvestors.push(investorId);
      await analyst.save();
    }

    // Populate the response
    await investor.populate('assignedAnalyst', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Analyst assigned successfully',
      investor: {
        id: investor._id,
        fullName: investor.fullName,
        email: investor.email,
        assignedAnalyst: investor.assignedAnalyst
      }
    });
  } catch (error) {
    console.error('Assign analyst error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Remove analyst assignment
router.delete('/remove-analyst/:investorId', [
  auth,
  authorize('analyst')
], async (req, res) => {
  try {
    const { investorId } = req.params;
    const analystId = req.user.userId;

    const investor = await User.findById(investorId);
    if (!investor || investor.role !== 'investor' || !investor.isActive) {
      return res.status(404).json({ 
        success: false,
        message: 'Investor not found' 
      });
    }

    // Check if this analyst is assigned to this investor
    if (!investor.assignedAnalyst || investor.assignedAnalyst.toString() !== analystId) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not assigned to this investor' 
      });
    }
    
    // Remove analyst from investor
    investor.assignedAnalyst = null;
    await investor.save();

    // Remove investor from analyst's assigned investors
    await User.findByIdAndUpdate(analystId, {
      $pull: { assignedInvestors: investorId }
    });

    res.json({
      success: true,
      message: 'Analyst assignment removed successfully'
    });
  } catch (error) {
    console.error('Remove analyst error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get assigned investors for current analyst
router.get('/analyst/investors', [
  auth,
  authorize('analyst')
], async (req, res) => {
  try {
    const analyst = await User.findById(req.user.userId)
      .populate('assignedInvestors', 'firstName lastName email createdAt preferences lastLogin')
      .select('assignedInvestors');

    res.json({
      success: true,
      investors: analyst.assignedInvestors || []
    });
  } catch (error) {
    console.error('Get assigned investors error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get assigned analyst for current investor
router.get('/investor/analyst', [
  auth,
  authorize('investor')
], async (req, res) => {
  try {
    const investor = await User.findById(req.user.userId)
      .populate('assignedAnalyst', 'firstName lastName email createdAt')
      .select('assignedAnalyst');

    res.json({
      success: true,
      analyst: investor.assignedAnalyst || null
    });
  } catch (error) {
    console.error('Get assigned analyst error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Update user preferences
router.put('/preferences', [
  auth,
  body('preferences.notifications').optional().isBoolean().withMessage('Notifications must be boolean'),
  body('preferences.theme').optional().isIn(['light', 'dark']).withMessage('Theme must be light or dark')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        $set: {
          'preferences.notifications': preferences.notifications ?? true,
          'preferences.theme': preferences.theme ?? 'light'
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get available investors (for analyst assignment)
router.get('/available/investors', [
  auth,
  authorize('analyst')
], async (req, res) => {
  try {
    const availableInvestors = await User.find({
      role: 'investor',
      isActive: true,
      assignedAnalyst: null // Only unassigned investors
    }).select('firstName lastName email createdAt');

    res.json({
      success: true,
      investors: availableInvestors
    });
  } catch (error) {
    console.error('Get available investors error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get user statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalAnalysts = await User.countDocuments({ role: 'analyst', isActive: true });
    const totalInvestors = await User.countDocuments({ role: 'investor', isActive: true });
    const assignedInvestors = await User.countDocuments({ 
      role: 'investor', 
      isActive: true,
      assignedAnalyst: { $ne: null } 
    });

    // If current user is analyst, get their specific stats
    let analystStats = null;
    if (req.user.role === 'analyst') {
      const analyst = await User.findById(req.user.userId).populate('assignedInvestors');
      analystStats = {
        assignedInvestors: analyst.assignedInvestors.length,
        investorNames: analyst.assignedInvestors.map(inv => inv.fullName)
      };
    }

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAnalysts,
        totalInvestors,
        assignedInvestors,
        unassignedInvestors: totalInvestors - assignedInvestors,
        analystStats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Update last login timestamp
router.post('/update-login', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      lastLogin: new Date()
    });

    res.json({
      success: true,
      message: 'Login timestamp updated'
    });
  } catch (error) {
    console.error('Update login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;
