const Bus = require("../models/Bus");
const Route = require("../models/Route");
const Seat = require("../models/Seat");
// ✅ Add new bus (Admin only)
const addBus = async (req, res) => {
  try {
    const { busNumber, routeId } = req.body;

    // Check if bus already exists
    const existingBus = await Bus.findOne({
      busNumber: { $regex: `^${busNumber.trim()}$`, $options: "i" },
    });
    if (existingBus) {
      return res
        .status(400)
        .json({ message: "Bus with this number already exists" });
    }

    // Validate routeId
    const route = await Route.findOne({
      routeId: { $regex: `^${routeId.trim()}$`, $options: "i" },
    });
    if (!route) {
      return res
        .status(404)
        .json({ message: "Invalid routeId. Please create the route first." });
    }

    // Create bus
    const bus = await Bus.create({
      ...req.body,
      routeId: route.routeId, // ensure routeId is valid and linked
    });

    res.status(201).json({ message: "Bus added successfully", bus });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all buses (with route info)
const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find();

    const busesWithRoute = await Promise.all(
      buses.map(async (bus) => {
        const route = await Route.findOne({ routeId: bus.routeId });
        return { ...bus.toObject(), route };
      })
    );

    res.status(200).json({ buses: busesWithRoute });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get bus by busNumber
const getBusByNumber = async (req, res) => {
  try {
    const trimmedBusNumber = req.params.busNumber.trim();

    console.log("Fetching bus:", trimmedBusNumber);

    const bus = await Bus.findOne({
      busNumber: { $regex: `^${trimmedBusNumber}$`, $options: "i" },
    });

    if (!bus) return res.status(404).json({ message: "Bus not found" });

    const route = await Route.findOne({ routeId: bus.routeId });
    const busWithRoute = { ...bus.toObject(), route };

    res.status(200).json({ bus: busWithRoute });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update bus info (Admin only)
const updateBus = async (req, res) => {
  try {
    const trimmedBusNumber = req.params.busNumber.trim();
    console.log("Updating Bus:", trimmedBusNumber);
    console.log("Request Body:", req.body);

    // Prevent busNumber change
    const { busNumber, ...updateData } = req.body;

    // If routeId is being updated, validate it
    if (updateData.routeId) {
      const validRoute = await Route.findOne({
        routeId: { $regex: `^${updateData.routeId.trim()}$`, $options: "i" },
      });
      if (!validRoute) {
        return res.status(404).json({ message: "Invalid routeId" });
      }
      updateData.routeId = validRoute.routeId;
    }


     // ✅ Map nested operator objects to flat fields
    if (updateData.operator1) {
      updateData.operatorName1 = updateData.operator1.name;
      updateData.operatorPhone1 = updateData.operator1.phone;
      delete updateData.operator1;
    }
    if (updateData.operator2) {
      updateData.operatorName2 = updateData.operator2.name;
      updateData.operatorPhone2 = updateData.operator2.phone;
      delete updateData.operator2;
    }

    const bus = await Bus.findOneAndUpdate(
      { busNumber: { $regex: `^${trimmedBusNumber}$`, $options: "i" } },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!bus) return res.status(404).json({ message: "Bus not found" });

    res.status(200).json({ message: "Bus updated successfully", bus });
  } catch (err) {
    console.error("UpdateBus Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete bus (Admin only)
const deleteBus = async (req, res) => {
  try {
    const trimmedBusNumber = req.params.busNumber.trim();

    const bus = await Bus.findOneAndDelete({
      busNumber: { $regex: `^${trimmedBusNumber}$`, $options: "i" },
    });

    if (!bus) return res.status(404).json({ message: "Bus not found" });

    res.status(200).json({ message: "Bus deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const searchBuses = async (req, res) => {
  try {
    let { source, destination, type, journeyDate } = req.query;

    source = source?.trim();
    destination = destination?.trim();
    type = type?.trim();

    if (!source || !destination || !journeyDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide source, destination, and journey date",
      });
    }

    // Parse journey date
    const startOfDay = new Date(journeyDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(journeyDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find route first
    const route = await Route.findOne({
      source: { $regex: `^${source}$`, $options: "i" },
      destination: { $regex: `^${destination}$`, $options: "i" },
    });

    if (!route) {
      return res.status(404).json({ 
        success: false,
        message: "No route found" 
      });
    }

    // Build bus query
    const busQuery = { routeId: route.routeId };
    if (type) busQuery.type = { $regex: `^${type}$`, $options: "i" };

    // Find buses
    const buses = await Bus.find(busQuery);

    if (!buses.length) {
      return res.status(404).json({ 
        success: false,
        message: "No buses found for this route" 
      });
    }

    // Get bus numbers
    const busNumbers = buses.map(bus => bus.busNumber);

    // Find seats for all buses on the journey date
    const seats = await Seat.find({
      busNumber: { $in: busNumbers },
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Create a map for quick seat lookup
    const seatMap = new Map();
    seats.forEach(seat => {
      seatMap.set(seat.busNumber, seat);
    });

    // Combine bus data with seat info
    const busesWithDetails = buses.map(bus => {
      const seatInfo = seatMap.get(bus.busNumber) || {
        busNumber: bus.busNumber,
        date: startOfDay,
        availableSeats: 0,
        seats: [],
        price: 0
      };

      return {
        busNumber: bus.busNumber,
        busName: bus.busName,
        type: bus.type,
        operatorName1: bus.operatorName1,
        operatorPhone1: bus.operatorPhone1,
        operatorName2: bus.operatorName2,
        operatorPhone2: bus.operatorPhone2,
        route: {
          routeId: route.routeId,
          source: route.source,
          destination: route.destination,
          distance: route.distance,
          duration: route.duration
        },
        seatInfo: seatInfo
      };
    });
    console.log(busesWithDetails)
    res.status(200).json({ 
      success: true,
      message: "Buses found successfully",
      count: busesWithDetails.length,
      buses: busesWithDetails 
    });

  } catch (err) {
    console.error("SearchBuses Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};



module.exports = {
  addBus,
  getAllBuses,
  getBusByNumber,
  updateBus,
  deleteBus,
  searchBuses,
};
