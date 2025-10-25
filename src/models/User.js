const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  mobileNo: { type: String, required: true, unique: true },
  altMobileNo: { type: String },
  dob: { type: Date },
  address: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  resetCode: { type: String },
  resetCodeExpiry: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
