const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

// Import models
const User = require("../models/User");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const Seat = require("../models/Seat");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

// MongoDB Database name → "NextStop"
const DB_URI = "mongodb://localhost:27017/NextStop";

// Utility function to load JSON
function loadJson(filePath) {
  const absolutePath = path.join(__dirname, filePath);
  const rawData = fs.readFileSync(absolutePath, "utf-8");
  if (!rawData) throw new Error(`${filePath} is empty`);
  return JSON.parse(rawData);
}


// Load synthetic JSON data
const users = loadJson("./users.json");
const routes = loadJson("./routes.json");
const buses = loadJson("./buses.json");
const seats = loadJson("./seats.json");
const bookings = loadJson("./bookings.json");
const payments = loadJson("./payments.json");

// Main seeding function
async function seed() {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected to NextStop Database");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await Payment.deleteMany({});
    await Booking.deleteMany({});
    await Seat.deleteMany({});
    await Bus.deleteMany({});
    await Route.deleteMany({});
    await User.deleteMany({});
    console.log("✅ All collections cleared.");

    console.log("🌱 Seeding new data...");

    // Hash user passwords
    const usersToInsert = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );
    const insertedUsers = await User.insertMany(usersToInsert);
    
    const insertedRoutes = await Route.insertMany(routes);
    const insertedBuses = await Bus.insertMany(buses);
    const insertedSeats = await Seat.insertMany(seats);
    const insertedBookings = await Booking.insertMany(bookings);

    // Link payments with actual booking IDs
    const paymentsToInsert = payments.map((p) => {
      const bookingDoc = insertedBookings[p.bookingIndex];
      if (!bookingDoc) throw new Error(`No booking found at index ${p.bookingIndex}`);
      return {
        bookingId: bookingDoc._id,
        paymentDateTime: p.paymentDateTime ? new Date(p.paymentDateTime) : new Date(),
        paymentType: p.paymentType, 
        transactionId: p.transactionId,
        amount: p.amount,
        paymentStatus: p.paymentStatus,
      };
    });

    const insertedPayments = await Payment.insertMany(paymentsToInsert);

    // Summary
    console.log("\n✅ Seeding complete:");
    console.log(`Users: ${insertedUsers.length}`);
    console.log(`Routes: ${insertedRoutes.length}`);
    console.log(`Buses: ${insertedBuses.length}`);
    console.log(`Seats: ${insertedSeats.length}`);
    console.log(`Bookings: ${insertedBookings.length}`);
    console.log(`Payments: ${insertedPayments.length}`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    await mongoose.disconnect();
  }
}

seed();
