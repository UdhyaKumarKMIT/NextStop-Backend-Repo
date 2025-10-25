const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Import Seat model
const Seat = require("../models/Seat");

// MongoDB Database name → "NextStop"
const DB_URI = "mongodb://localhost:27017/NextStop";

// Utility function to load JSON
function loadJson(filePath) {
  const absolutePath = path.join(__dirname, filePath);
  const rawData = fs.readFileSync(absolutePath, "utf-8");
  if (!rawData) throw new Error(`${filePath} is empty`);
  return JSON.parse(rawData);
}

// Load only seats.json
const seats = loadJson("./seats.json");

// Main seeding function
async function seed() {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected to NextStop Database");

    // Clear old data (optional)
    await Seat.deleteMany({});
    console.log("🧹 Cleared old seat data");

    // Insert new seats
    const insertedSeats = await Seat.insertMany(seats);
    console.log(`✅ Inserted ${insertedSeats.length} seats successfully.`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    await mongoose.disconnect();
  }
}

seed();
