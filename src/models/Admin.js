const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
  resetCode: String,
  resetCodeExpiry: Date
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password
adminSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
