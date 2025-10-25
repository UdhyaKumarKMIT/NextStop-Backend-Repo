const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true }, // Primary identifier
  busName: { type: String, required: true },
  type: { type: String, enum: ["AC", "Non-AC", "Sleeper"], required: true },
  routeId: { type: String, required: true }, // e.g. "route1"
  operatorName1: { type: String },
  operatorPhone1: { type: String },
  operatorName2: { type: String },
  operatorPhone2: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Bus", busSchema);

