// routes/routeRoutes.js
const express = require("express");
const router = express.Router();
const {
  addRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute
} = require("../controllers/routeController");

const { authBooking } = require("../models/middleware/authMiddleware"); // Temporary auth
const { authAdmin } = require("../models/middleware/adminMiddleware"); // Admin only

// Public routes
router.get("/", getAllRoutes);
router.get("/:routeId", getRouteById);

// Admin routes
router.post("/", authBooking, authAdmin, addRoute);
router.put("/:routeId", authBooking, authAdmin, updateRoute);
router.delete("/:routeId", authBooking, authAdmin, deleteRoute);

module.exports = router;
