const express = require("express");
const router = express.Router();

const {
  addBus,
  getAllBuses,
  getBusByNumber,
  updateBus,
  deleteBus,
  searchBuses,
} = require("../controllers/busController");

const { authBooking } = require("../models/middleware/authMiddleware"); // Users
const { authAdmin } = require("../models/middleware/adminMiddleware");   // Admins

// 🚌 Public routes
router.get("/", getAllBuses);
router.get("/search", searchBuses);
router.get("/:busNumber", getBusByNumber);

// 🛠️ Admin protected routes
router.post("/add", authAdmin, addBus);
router.put("/:busNumber", authAdmin, updateBus);
router.delete("/:busNumber", authAdmin, deleteBus);

module.exports = router;
