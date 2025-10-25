const Feedback = require("../models/Feedback");
const User = require("../models/User");
const Bus = require("../models/Bus");

// Get all feedbacks with populated user and bus details
const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "username")  // get username from User
      .populate("bus", "busNumber busName") // get busNumber and busName from Bus
      .sort({ createdAt: -1 });

    res.status(200).json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Optional: add feedback
const addFeedback = async (req, res) => {
  try {
    const { userId, busId, rating, comment } = req.body;
    const feedback = await Feedback.create({ user: userId, bus: busId, rating, comment });
    res.status(201).json({ message: "Feedback added", feedback });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getAllFeedbacks, addFeedback };
