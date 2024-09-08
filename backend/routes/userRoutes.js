import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getUserProfile,
  followUser,
  getSuggestions,
  updateUserProfile,
} from "../controllers/userController.js";
const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggestions", protectRoute, getSuggestions);
router.post("/follow/:userId", protectRoute, followUser);
router.put("/update", protectRoute, updateUserProfile);

export default router;
