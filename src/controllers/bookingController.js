const Booking = require("../models/Booking");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const Seat = require("../models/Seat");


// ---------------- BOOK A TICKET ----------------
const bookTicket = async (req, res) => {
  try {
    const { busNumber, routeId, seatNumbers, journeyDate, boardingPoint } = req.body;
    const username = req.User.username; // from JWT middleware

    // Validate required fields
    if (!busNumber || !routeId || !seatNumbers || !journeyDate) {
      return res.status(400).json({ message: "Missing required booking details" });
    }

    // Normalize seat numbers
    let selectedSeats = [];
    if (typeof seatNumbers === "string") {
      selectedSeats = seatNumbers.split(",").map(s => s.trim());
    } else if (Array.isArray(seatNumbers)) {
      selectedSeats = seatNumbers.map(s => s.trim());
    } else {
      return res.status(400).json({ message: "Invalid seatNumbers format" });
    }

    // Fetch bus and route
    const bus = await Bus.findOne({ busNumber });
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    const route = await Route.findOne({ routeId });
    if (!route) return res.status(404).json({ message: "Route not found" });

    // Get seat data for that date
    const seatData = await Seat.findOne({ busNumber, date: journeyDate });
    if (!seatData) return res.status(404).json({ message: "Seat data not found for this date" });

    // Check seat availability
    const unavailableSeats = selectedSeats.filter(s => !seatData.seats.includes(s));
    if (unavailableSeats.length > 0) {
      return res.status(400).json({ message: `Seats ${unavailableSeats.join(", ")} are not available` });
    }

    // Update seat availability
    seatData.seats = seatData.seats.filter(s => !selectedSeats.includes(s));
    seatData.availableSeats -= selectedSeats.length;
    await seatData.save();

    // Calculate fare
    const totalFare = seatData.price * selectedSeats.length;

    // Create booking
    const newBooking = new Booking({
      userId: username,
      busId: busNumber,
      routeId,
      totalSeats: selectedSeats.length,
      seatNumbers: selectedSeats, // ✅ directly as array
      totalFare,
      journeyDate,
      boardingPoint,
      bookingStatus: "Confirmed",
    });

    await newBooking.save();

    res.status(201).json({
      message: "Booking successful",
      booking: newBooking,
    });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- CANCEL BOOKING ----------------
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.userId !== req.user.username)
      return res.status(403).json({ message: "Not authorized to cancel this booking" });

    const seatData = await Seat.findOne({ busNumber: booking.busId, date: booking.journeyDate });
    if (seatData) {
      // Restore seats
      seatData.seats.push(...booking.seatNumbers);
      seatData.availableSeats += booking.seatNumbers.length;
      await seatData.save();
    }

    booking.bookingStatus = "Cancelled";
    booking.updatedAt = new Date();
    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    console.error("Cancel Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- GET USER BOOKINGS ----------------
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.username });
    res.json({ bookings });
  } catch (err) {
    console.error("Get Bookings Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { bookTicket, cancelBooking, getUserBookings };
