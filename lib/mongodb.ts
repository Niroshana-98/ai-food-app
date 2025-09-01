import mongoose from "mongoose";
const MONGODB_URI =  "mongodb+srv://mytharindud_db_user:4zXuP5k3lkGDcH1B@dishai.xolxtbs.mongodb.net/dishAI?retryWrites=true&w=majority&appName=DishAI";
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connected:", conn.connection.host);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
