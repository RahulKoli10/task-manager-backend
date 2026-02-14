import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("admin", "manager"),
  createTask
);

router.get("/", protect, getTasks);

router.put("/:id", protect, updateTask);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "manager"),
  deleteTask
);

export default router;
