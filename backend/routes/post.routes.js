import express from "express";

import {
  createPost,
  deletePost,
  updatePost,
  allPosts,
  commentOnPost,
  likeUnlikePost,
  getSuggestedPosts,
  getLikedPosts,
  getUserPost,
} from "../controllers/post.controller";

import { protectRoute } from "../middlewares/protectRoute";

const router = express.Router();

router.post("/createPost", protectRoute, createPost);
router.delete("/deletePost/:id", protectRoute, deletePost);
router.post("/updatePost/:id", protectRoute, updatePost);
router.get("/allPosts", protectRoute, allPosts);
router.get("/comment/:id", protectRoute, commentOnPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.get("/suggestedPosts", protectRoute, getSuggestedPosts);
router.get("/liked/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPost);

export default router;
