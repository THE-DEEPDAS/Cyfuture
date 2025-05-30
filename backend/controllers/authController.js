import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from 'express-async-handler';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyName, industry } = req.body;
  
  // Check if user already exists
  const userExists = await User.findOne({ email });
  
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  
  // Create user
  const userData = {
    name,
    email,
    password,
    role
  };
  
  // Add company specific fields if role is company
  if (role === 'company') {
    if (!companyName) {
      res.status(400);
      throw new Error('Company name is required');
    }
    
    userData.companyName = companyName;
    
    if (industry) {
      userData.industry = industry;
    }
  }
  
  const user = await User.create(userData);
  
  if (user) {
    // Generate JWT token
    const token = generateToken(user._id);
    
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.role === 'company' && { 
          companyName: user.companyName,
          industry: user.industry
        })
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user / Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Find user by email
  const user = await User.findOne({ email });
  
  // Check if user exists and password is correct
  if (user && (await user.matchPassword(password))) {
    // Generate JWT token
    const token = generateToken(user._id);
    
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.role === 'company' && { 
          companyName: user.companyName,
          industry: user.industry
        })
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

export { registerUser, loginUser };