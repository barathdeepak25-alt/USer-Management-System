const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Helper to create a signed JWT for a given user
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Basic email format check
const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

// -----------------------------------------------------------------------
// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
// -----------------------------------------------------------------------
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // ---- Validation ----
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "A valid email is required" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 6 characters long" });
    }
    if (phone && !/^\d{7,15}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    // ---- Duplicate email check ----
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email is already registered" });
    }

    // ---- Hash password ----
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ---- Create user ----
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user,
    });
  } catch (error) {
    // Handles Mongoose validation errors and duplicate key errors cleanly
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Email is already registered" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error("Register error:", error.message);
    res.status(500).json({ success: false, message: "Server error while registering user" });
  }
};

// -----------------------------------------------------------------------
// @route   POST /api/users/login
// @desc    Login user and return JWT
// @access  Public
// -----------------------------------------------------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Server error while logging in" });
  }
};

// -----------------------------------------------------------------------
// @route   GET /api/users
// @desc    Get all users
// @access  Private
// -----------------------------------------------------------------------
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error("Get users error:", error.message);
    res.status(500).json({ success: false, message: "Server error while fetching users" });
  }
};

// -----------------------------------------------------------------------
// @route   GET /api/users/:id
// @desc    Get a single user by ID
// @access  Private
// -----------------------------------------------------------------------
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    console.error("Get user error:", error.message);
    res.status(500).json({ success: false, message: "Server error while fetching user" });
  }
};

// -----------------------------------------------------------------------
// @route   PUT /api/users/:id
// @desc    Update a user
// @access  Private
// -----------------------------------------------------------------------
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (email && email.toLowerCase() !== user.email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: "A valid email is required" });
      }
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ success: false, message: "Email is already registered" });
      }
      user.email = email.toLowerCase();
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, message: "Name cannot be empty" });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      if (phone && !/^\d{7,15}$/.test(phone)) {
        return res.status(400).json({ success: false, message: "Invalid phone number" });
      }
      user.phone = phone;
    }

    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ success: false, message: "Password must be at least 6 characters long" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      console.log(user.password);
      
    }
  

    const updatedUser = await user.save();
    res.status(200).json({ success: true, message: "User updated successfully", user: updatedUser });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error("Update user error:", error.message);
    res.status(500).json({ success: false, message: "Server error while updating user" });
  }
};

// -----------------------------------------------------------------------
// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private
// -----------------------------------------------------------------------
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    console.error("Delete user error:", error.message);
    res.status(500).json({ success: false, message: "Server error while deleting user" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
