import express from "express";
import { getAllUsers, getUserById, updateRoleToEmployee } from "../Controllers/UserController.js";
import { isAdmin } from "../Middlewares/IsAdminMiddleware.js";
import { Authenticate } from "../Middlewares/authMiddleware.js";

const userRoutes = express.Router();

// ملاحظة: لا حدا يلعب بترتيب ال middlewares هي لأن لح ينتزع الشغل، في وحدة بتاخد معلومات من التانية
// Middlewares
userRoutes.use(Authenticate);
userRoutes.use(isAdmin);

userRoutes.get("/", getAllUsers);
userRoutes.get("/:id", getUserById);
userRoutes.put("/:id/update-role-to-employee", updateRoleToEmployee);

export default userRoutes;

