console.log("✅ Reached top of authController");

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Admin = require('../models/Admin');

console.log("✅ Models loaded successfully");
// ✅ Configure nodemailer (use env variables)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

console.log("✅ Nodemailer setup done");
// ----------------- USER REGISTER -----------------
const register = async (req, res) => {
  const {
    username,
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    mobileNo,
    altMobileNo,
    dob,
    address
  } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // ✅ Check existing username or email
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser)
      return res.status(400).json({ message: "Username or email already exists" });

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      mobileNo,
      altMobileNo,
      dob,
      address
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ----------------- ADMIN REGISTER -----------------
const adminRegister = async (req, res) => {
  const {
    username,
    email,
    password,
    confirmPassword,
    role = 'admin'
  } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    // ✅ Check existing admin username or email
    const existingAdmin = await Admin.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingAdmin) {
      return res.status(400).json({ 
        message: "Admin with this username or email already exists" 
      });
    }

    // ✅ Create admin (password will be hashed by pre-save middleware)
    const newAdmin = new Admin({
      username,
      email,
      password,
      role
    });

    await newAdmin.save();

    res.status(201).json({ 
      message: "Admin registered successfully",
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });

  } catch (err) {
    console.error("Admin Registration Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ----------------- USER LOGIN -----------------
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // ✅ Allow login with either username or email
    const user = await User.findOne({ 
      $or: [{ username: username }, { email: username }] 
    });

    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    // ✅ Generate JWT
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username, 
        email: user.email,
        role: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ 
      message: "Login successful", 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      role: 'user'
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ----------------- ADMIN LOGIN -----------------
const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  // Validate required fields
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    // ✅ Find admin by username or email
    const admin = await Admin.findOne({ 
      $or: [{ username: username }, { email: username }],
      isActive: true 
    });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Check password using the model method
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        username: admin.username,
        email: admin.email,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      },
      role: admin.role
    });

  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ----------------- FORGOT PASSWORD -----------------
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    user.resetCode = code;
    user.resetCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 min expiry
    await user.save();

    // ✅ Send email
    await transporter.sendMail({
      from: '"NextStop Support" <studycegmit@gmail.com>',
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is ${code}. It will expire in 10 minutes.`
    });

    res.json({ message: "Reset code sent to email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ----------------- ADMIN FORGOT PASSWORD -----------------
const adminForgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // ✅ Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    admin.resetCode = code;
    admin.resetCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 min expiry
    await admin.save();

    // ✅ Send email
    await transporter.sendMail({
      from: '"NextStop Admin Support" <studycegmit@gmail.com>',
      to: email,
      subject: "Admin Password Reset Code",
      text: `Your admin password reset code is ${code}. It will expire in 10 minutes.`
    });

    res.json({ message: "Reset code sent to admin email" });
  } catch (err) {
    console.error("Admin Forgot Password Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ----------------- RESET PASSWORD -----------------
const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found Register First" });

    // ✅ Validate code and expiry
    if (user.resetCode !== code || user.resetCodeExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    // ✅ Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ----------------- ADMIN RESET PASSWORD -----------------
const adminResetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // ✅ Validate code and expiry
    if (admin.resetCode !== code || admin.resetCodeExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    // ✅ Update password (will be hashed by pre-save middleware)
    admin.password = newPassword;
    admin.resetCode = undefined;
    admin.resetCodeExpiry = undefined;

    await admin.save();

    res.json({ message: "Admin password reset successful" });
  } catch (err) {
    console.error("Admin Reset Password Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ----------------- GET ADMIN PROFILE -----------------
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ admin });
  } catch (err) {
    console.error("Get Admin Profile Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ----------------- UPDATE ADMIN PROFILE -----------------
const updateAdminProfile = async (req, res) => {
  const { username, email } = req.body;

  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if username or email already exists (excluding current admin)
    if (username) {
      const existingAdmin = await Admin.findOne({ 
        username, 
        _id: { $ne: req.admin.id } 
      });
      if (existingAdmin) {
        return res.status(400).json({ message: "Username already exists" });
      }
      admin.username = username;
    }

    if (email) {
      const existingAdmin = await Admin.findOne({ 
        email, 
        _id: { $ne: req.admin.id } 
      });
      if (existingAdmin) {
        return res.status(400).json({ message: "Email already exists" });
      }
      admin.email = email;
    }

    await admin.save();

    res.json({ 
      message: "Admin profile updated successfully",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error("Update Admin Profile Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ========== GET USER PROFILE ==========

// ----------------- GET USER PROFILE -----------------
const getUserProfile = async (req, res) => {
  try {
    // req.user is set by JWT middleware (you'll see that below)
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Get User Profile Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ============Update user profile ============

const updateUserProfile = async (req, res) => {
  const { username, email, firstName, lastName, mobileNo, altMobileNo, dob, address } = req.body;

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check username uniqueness
    if (username && username !== user.username) {
      const exists = await User.findOne({ username, _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ message: "Username already exists" });
      user.username = username;
    }

    // Check email uniqueness
    if (email && email !== user.email) {
      const exists = await User.findOne({ email, _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ message: "Email already exists" });
      user.email = email;
    }

    // Check mobile number uniqueness
    if (mobileNo && mobileNo !== user.mobileNo) {
      const exists = await User.findOne({ mobileNo, _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ message: "Mobile number already exists" });
      user.mobileNo = mobileNo;
    }

    // Update optional fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (altMobileNo !== undefined) user.altMobileNo = altMobileNo;
    if (dob !== undefined) user.dob = dob;
    if (address !== undefined) user.address = address;

    await user.save();

    res.json({
      message: "User profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNo: user.mobileNo,
        altMobileNo: user.altMobileNo,
        dob: user.dob,
        address: user.address
      }
    });
  } catch (err) {
    console.error("Update User Profile Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




console.log("✅ Bottom of authController reached");

module.exports = { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  adminRegister,
  adminLogin,
  adminForgotPassword,
  adminResetPassword,
  getAdminProfile,
  updateAdminProfile,
  getUserProfile,
  updateUserProfile
};