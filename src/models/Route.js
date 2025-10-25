const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true }, // e.g. "route1"
  source: { type: String, required: true },
  destination: { type: String, required: true },
  distance: { type: Number, required: true },
  duration: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Route", routeSchema);

