import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  deleteNotification,
  getAllNotifications,
} from "../controllers/notificationController.js";
const router = express.Router();

router.get("/all", protectRoute, getAllNotifications);
router.delete("/delete/:id", protectRoute, deleteNotification);

export default router;
