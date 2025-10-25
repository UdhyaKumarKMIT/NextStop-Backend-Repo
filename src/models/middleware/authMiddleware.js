const jwt = require("jsonwebtoken");
const User = require("../User");
const Admin = require("../Admin");

const authBooking = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ message: "Access denied, no token" });

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ message: "Invalid token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // First check User collection
    let user = await User.findById(decoded.id);

    // If not found and role is admin/superadmin, attach to req.admin instead
    if (!user && (decoded.role === "admin" || decoded.role === "superadmin")) {
      const admin = await Admin.findById(decoded.id);
      if (!admin) return res.status(403).json({ message: "Forbidden: Users only" });
      req.admin = admin;
      req.user = null;
    } else if (user) {
      req.user = user;
    } else {
      return res.status(403).json({ message: "Forbidden: Users only" });
    }

    next();
  } catch (err) {
    console.error("Auth Booking Middleware Error:", err);
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

module.exports = { authBooking };
