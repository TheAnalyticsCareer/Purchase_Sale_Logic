const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routers/auth");
const salesRoutes=require("./routers/sales");
const purchaseRoutes=require("./routers/purchses")

dotenv.config();  

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/user", authRoutes);
app.use("/sales",salesRoutes);
app.use("/purchase",purchaseRoutes)

// Health Check Route
app.get("/", (req, res) => {
  res.send("MySQL AWS RDS Connected Successfully!");
});

// Start the Server
const PORT = process.env.PORT || 5555;

app.listen(PORT, () => {
  console.log(` Server running on port -----${PORT}`);
}).on("error", (err) => {
  console.error(" Error starting the server:", err);
});

// Global Error Handlers
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(" Unhandled Rejection at:", promise, "reason:", reason);
});
