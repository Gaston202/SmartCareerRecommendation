// Main entry point for the backend application

const express = require('express');
const connectDb = require("./Configuration/connectDB");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

app.use(cors());
const app = express();
connectDb();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
