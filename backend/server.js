import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import { connectDB } from "./database/db_connect.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary Cloud Name
  api_key: process.env.CLOUDINARY_API_KEY, // Your Cloudinary API Key
  api_secret: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary API Secret
});

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", authRouter);

app.listen(5000, (req, res) => {
  connectDB();
  console.log("app is listining at the port 5000");
});
