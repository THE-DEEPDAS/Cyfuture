import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      title: user.title,
      location: user.location,
      profileImage: user.profileImage,
      preferredLanguage: user.preferredLanguage,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, company } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    company: role === 'employer' ? company : undefined,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.title = req.body.title || user.title;
    user.location = req.body.location || user.location;
    user.bio = req.body.bio || user.bio;
    user.preferredLanguage = req.body.preferredLanguage || user.preferredLanguage;
    
    if (req.body.skills) {
      user.skills = req.body.skills;
    }
    
    if (req.body.profileImage) {
      user.profileImage = req.body.profileImage;
    }
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      company: updatedUser.company,
      title: updatedUser.title,
      location: updatedUser.location,
      profileImage: updatedUser.profileImage,
      bio: updatedUser.bio,
      skills: updatedUser.skills,
      preferredLanguage: updatedUser.preferredLanguage,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    
    if (user.role === 'employer') {
      user.company = req.body.company || user.company;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      company: updatedUser.company,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Save job to user's saved jobs
// @route   PUT /api/users/save-job/:id
// @access  Private
const saveJob = asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  const user = await User.findById(req.user._id);

  if (user) {
    // Check if job is already saved
    if (user.savedJobs.includes(jobId)) {
      res.status(400);
      throw new Error('Job already saved');
    }

    user.savedJobs.push(jobId);
    await user.save();
    
    res.json({ message: 'Job saved successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Remove job from user's saved jobs
// @route   PUT /api/users/unsave-job/:id
// @access  Private
const unsaveJob = asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  const user = await User.findById(req.user._id);

  if (user) {
    user.savedJobs = user.savedJobs.filter(
      (savedJob) => savedJob.toString() !== jobId
    );
    
    await user.save();
    
    res.json({ message: 'Job removed from saved jobs' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user's saved jobs
// @route   GET /api/users/saved-jobs
// @access  Private
const getSavedJobs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedJobs');

  if (user) {
    res.json(user.savedJobs);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  saveJob,
  unsaveJob,
  getSavedJobs,
};