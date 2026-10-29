const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`Please ensure your local MongoDB service is running, or provide a valid Atlas connection string in server/.env`);
    process.exit(1);
  }
};

module.exports = connectDB;
