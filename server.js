const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const seedSuperAdmin = require("./utils/seedSuperAdmin");

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://eventcloud-wwds.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(bodyParser.json());

// Routes
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");

app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/superadmin", superAdminRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("MongoDB connected");
    seedSuperAdmin(); // Call this after successful DB connection
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Error Handler Middleware
const errorHandler = require("./middlewares/errorMiddleware");
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || "5000";
const BaseUrl = process.env.BASE_URL || "http://localhost";
app.listen(PORT, () => {
  console.log(`Server running on ${BaseUrl}:${PORT}`);
});
