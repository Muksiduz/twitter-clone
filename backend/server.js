import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import { connectDB } from "./database/db_connect.js";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";

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

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);

app.listen(5000, (req, res) => {
  connectDB();
  console.log("app is listining at the port 5000");
});
