const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Import Feedback model
const Feedback = require("../models/Feedback");

// MongoDB URI
const DB_URI = "mongodb://localhost:27017/NextStop";

// Load JSON utility
function loadJson(filePath) {
  const absolutePath = path.join(__dirname, filePath);
  const rawData = fs.readFileSync(absolutePath, "utf-8");
  if (!rawData) throw new Error(`${filePath} is empty`);
  return JSON.parse(rawData);
}

// Load feedbacks.json
const feedbacks = loadJson("./feedback.json");

// Main seeding function
async function seedFeedbacks() {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected to NextStop Database");

    // Clear old feedbacks (optional)
    await Feedback.deleteMany({});
    console.log("🧹 Cleared old feedback data");

    // Insert new feedbacks
    const insertedFeedbacks = await Feedback.insertMany(feedbacks);
    console.log(`✅ Inserted ${insertedFeedbacks.length} feedbacks successfully.`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    await mongoose.disconnect();
  }
}

seedFeedbacks();
