import User from "../model/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "token not found" });

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) return res.status(401).json({ message: "token not found" });

    const user = await User.findById(decode.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    //it was res.user = user but i think it will be wrong
    //nah i think it was correct
    //req.user = user
    res.user = user;

    next();
  } catch (error) {
    console.log("Error in Protect Route Middleware :", error);
    res.status(500).json({
      message: "error in protectRoute middleware",
    });
  }
};
