import express from "express";
import {
  followUnfollowUser,
  getSingleUser,
  getAllUsers,
  updateProfile,
  getSuggestedUser,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/allUsers", protectRoute, getAllUsers);
router.get("/profile/:username", protectRoute, getSingleUser);
router.post("/update", protectRoute, updateProfile);
router.post("/follow/:id", protectRoute, followUnfollowUser);
//todo :- need to make suggested users
router.get("/suggested", protectRoute, getSuggestedUser);

export default router;
