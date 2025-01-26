import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connection :", connect.connection.host);
  } catch (error) {
    console.log("error at connecting database :", error);
    process.exit(1);
  }
};
