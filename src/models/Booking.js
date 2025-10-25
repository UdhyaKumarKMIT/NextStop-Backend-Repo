const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  username: { type: String, required: true }, // reference User.username
  busNumber: { type: String, required: true }, // reference Bus.busNumber
  routeId: { type: String, required: true }, // reference Route.routeId
  totalSeats: { type: Number, required: true },
  seatNumbers: { type: [String], required: true }, // ✅ array of strings

  totalFare: { type: Number, required: true },
  journeyDate: { type: Date, required: true },
  boardingPoint: { type: String, required: true },
  bookingStatus: { type: String, enum: ["Confirmed", "Pending", "Cancelled"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);

