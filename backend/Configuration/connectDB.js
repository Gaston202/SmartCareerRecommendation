const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const url = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-career-recommendation';
    
    await mongoose.connect(url);
    console.log("✅ Connected to MongoDB successfully.");
    console.log(`📍 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ Connection to MongoDB failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDb;
