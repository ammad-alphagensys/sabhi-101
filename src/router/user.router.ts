import { Router } from "express";
import { createUser, getUser, getUsers, deleteUser } from "@/handler/user.handler";
import { protect, restrictTo } from "@/middleware/express";
import { mediaUpload } from "@/library/utils";
import { multerToBody } from "@/middleware/express";

const userRouter = Router();

/**
 * Global protection middleware: all routes require login
 * Role-based restriction applied per route
 * Rate limiting can also be applied per route or globally
 */

// Create user (Super Admin only)
userRouter.post(
  "/",
  mediaUpload.single("image"),
  multerToBody,
  // protect,
  // restrictTo("super_admin"),
  // rateLimiter({ action: "create_user", limit: 10, windowInSeconds: 60 }), // example
  createUser,
);

// Get all users (Super Admin only)
userRouter.get(
  "/",
  // protect,
  // restrictTo("super_admin"),
  getUsers,
);

// Get single user by ID
userRouter.get(
  "/:id",
  // protect,
  // restrictTo("super_admin", "business_admin"),
  getUser,
);

// Delete user by ID
userRouter.delete(
  "/:id",
  // protect,
  // restrictTo("super_admin"),
  deleteUser,
);

export { userRouter };
