const express = require("express");
const router = express.Router();
const { getAllFeedbacks, addFeedback } = require("../controllers/feedbackController");

// Public: get all feedbacks
router.get("/getfeedbacks", getAllFeedbacks);

// Optional: add feedback
router.post("/addfeedback", addFeedback);

module.exports = router;
