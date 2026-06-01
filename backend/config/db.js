import dotenv from "dotenv";
dotenv.config(); // safety net in case server.js hasn't loaded it yet

import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error(
        "MONGO_URI is undefined. Check that your .env file exists in the backend root and contains MONGO_URI=...",
      );
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDb;
