const express = require("express");
const router = express.Router();
const { authBooking } = require("../models/middleware/authMiddleware");
const {
  bookTicket,
  cancelBooking,
  getUserBookings
} = require("../controllers/bookingController");

// Protected routes
router.post("/", authBooking, bookTicket);           // Book a ticket
router.put("/cancel/:id", authBooking, cancelBooking); // Cancel a booking
router.get("/user", authBooking, getUserBookings);     // Get all bookings for logged-in user

module.exports = router;
