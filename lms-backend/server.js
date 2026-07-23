const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables from the .env file

const app = express();

app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend
app.use(express.json()); // Parse requests with JSON payloads

// 3. Retrieve the database connection string from environment variables
const mongoURI = process.env.MONGO_URI;

// 4. Connect to MongoDB using Mongoose
mongoose
  .connect(mongoURI, {
    family: 4, // Force Mongoose use IPv4 , skip IPv6
  })
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("Database connection failed. Error details:");
    console.error(err);
  });

const quizzesRoutes = require("./routes/quizzes");
app.use("/api/quizzes", quizzesRoutes);

app.get("/", (req, res) => {
  res.send("LMS backend server is up and running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Backend server successfully started, listening on port: ${PORT}`,
  );
});
