const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  busNumber: { type: String, required: true }, // references Bus.busNumber
  totalSeats: { type: Number, required: true },
  date: { type: Date, required: true },
  availableSeats: { type: Number, required: true },
  seats: {
    type: [String], // ✅ Array of seat identifiers like ["1-1", "1-2", "2-3"]
    default: [],
  },
  price: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Seat", seatSchema);


