// Imports
import express from "express"; // Import Express framework
import cors from "cors"; // Enables Cross Origin Resource Sharing
import morgan from "morgan"; // Logs HTTP requests
import data from "./config/config.js"; // Use environment variables
import { router } from "./routes/routes.js"; // Router for backend routes

const app = express(); // Create an Express application

// Middleware setup
app.use(cors()); // Allow cross-origin requests
app.use(morgan("dev")); // Log incoming requests in "dev" format

// Routes
app.use("/api", router); // Mount API routes under /api

// Default route for root path
app.get("/", (req, res) => {
  res.send("Welcome to the API Gateway");
});

// Start the server
app.listen(data.PORT, () => {
  console.log(`API Gateway is running on http://localhost:${data.PORT}`);
});
