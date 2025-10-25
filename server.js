const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
const authRoutes = require('./src/routes/authRoutes');
console.log("✅ Auth routes mounted at /api/auth");
const busRoutes = require('./src/routes/busRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const routeRoutes = require('./src/routes/routeRoutes');
const auth = require('./src/models/middleware/authMiddleware'); // adjust path as needed
const feedbackRoutes = require("./src/routes/feedbackRoutes");

app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/bookings',bookingRoutes);
app.use('/api/routes',routeRoutes)
app.use("/api/feedbacks", feedbackRoutes);

// Start Server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});
