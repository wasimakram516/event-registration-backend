const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000", // Frontend local development
     "https://eventcloud-wwds.vercel.app"// Frontend production URL
  ],
  credentials: true, // Enable if you are using cookies for authentication
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
}));
app.use(bodyParser.json());

// Routes
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/admin", adminRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
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
