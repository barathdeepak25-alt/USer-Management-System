const mongoose = require("mongoose");

// Connects to MongoDB using the connection string in the .env file.
// If the connection fails (e.g. MongoDB isn't running), we log a clear
// error and stop the server instead of letting it run in a broken state.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
