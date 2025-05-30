import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    if (user.role === 'company') {
      user.companyName = req.body.companyName || user.companyName;
      user.industry = req.body.industry || user.industry;
    } else if (user.role === 'candidate') {
      // Update candidate specific fields
      if (req.body.skills) {
        user.skills = req.body.skills;
      }
      
      if (req.body.experience) {
        user.experience = req.body.experience;
      }
      
      if (req.body.education) {
        user.education = req.body.education;
      }
    }
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      ...(updatedUser.role === 'company' && { 
        companyName: updatedUser.companyName,
        industry: updatedUser.industry
      }),
      ...(updatedUser.role === 'candidate' && { 
        skills: updatedUser.skills,
        experience: updatedUser.experience,
        education: updatedUser.education
      })
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export { getCurrentUser, updateUserProfile };