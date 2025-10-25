const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  paymentDateTime: { type: Date, default: Date.now },
  paymentType: { type: String, enum: ["Credit Card", "Debit Card", "UPI", "Net Banking", "Wallet"], required: true },
  transactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["Success", "Pending", "Failed"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);

