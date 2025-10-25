// controllers/routeController.js
const Route = require("../models/Route");

// ✅ Add a new route (Admin only)
const addRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ message: "Route added successfully", route });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all routes
const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.json({ routes });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get route by routeId
const getRouteById = async (req, res) => {
  try {
    const trimmedRouteId = req.params.routeId.trim();
    console.log("Fetching route:", trimmedRouteId);
    const route = await Route.findOne(
      { routeId: { $regex: `^${trimmedRouteId}$`, $options: "i" } }, // ✅ case-insensitive match
    
    );
    if (!route) return res.status(404).json({ message: "Route not found" });

    res.json({ route });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update route info (Admin only)
const updateRoute = async (req, res) => {
  try {
    const trimmedRouteId = req.params.routeId.trim();
    console.log("Updating route:", trimmedRouteId);

    // Prevent changing routeId
    const { routeId, ...updateData } = req.body;

    const route = await Route.findOneAndUpdate(
      { routeId: { $regex: `^${trimmedRouteId}$`, $options: "i" } }, // ✅ case-insensitive match
      updateData,
      { new: true }
    );

    if (!route) return res.status(404).json({ message: "Route not found" });

    res.json({ message: "Route updated successfully", route });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete route (Admin only)
const deleteRoute = async (req, res) => {
  try {
    const trimmedRouteId = req.params.routeId.trim();
    console.log("Deleting route:", trimmedRouteId);

    const route = await Route.findOneAndDelete(
      { routeId: { $regex: `^${trimmedRouteId}$`, $options: "i" } }, // ✅ case-insensitive match
    );
    
    if (!route) return res.status(404).json({ message: "Route not found" });

    res.json({ message: "Route deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  addRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute
};
