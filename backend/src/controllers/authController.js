const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, organizationName } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password required",
        data: null,
      });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered", data: null });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: role || "applicant",
      organizationName,
    });
    const token = signToken(user);
    res.status(201).json({
      success: true,
      message: "Registered",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
        data: null,
      });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials", data: null });
    }
    const token = signToken(user);
    res.json({
      success: true,
      message: "OK",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

exports.me = async (req, res) => {
  res.json({ success: true, message: "OK", user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, organizationName, walletAddress } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, organizationName, walletAddress },
      { new: true }
    ).select("-password");
    res.json({ success: true, message: "Updated", user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
