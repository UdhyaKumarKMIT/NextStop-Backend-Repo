const jwt = require("jsonwebtoken");
const Admin = require("../Admin"); // Correct path to your Admin model

const authAdmin = async (req, res, next) => {
  try {
    // 1️⃣ Get token from Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Access denied, no token" });
    }

    // 2️⃣ Extract token (Bearer <token>)
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // 3️⃣ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // 4️⃣ Find admin from decoded ID
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    // 5️⃣ Check role (allow both admin and superadmin)
    if (decoded.role !== "admin" && decoded.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    // 6️⃣ Attach admin to request and continue
    req.admin = admin;
    next();
  } catch (err) {
    console.error("AuthAdmin Middleware Error:", err);
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

module.exports = { authAdmin };
