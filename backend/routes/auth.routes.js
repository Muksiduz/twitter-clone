import express from "express";
import {
  getme,
  signup,
  login,
  logout,
  getAllUsers,
  getSingleUser,
  updateProfile,
} from "../controllers/auth.controllers.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/me", protectRoute, getme);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/allUsers", protectRoute, getAllUsers);
router.get("/:username", protectRoute, getSingleUser);
router.post("/update", protectRoute, updateProfile);

export default router;
