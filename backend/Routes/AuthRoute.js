import express from "express";
import { register, login } from "../Controllers/AuthController.js";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);

export default authRoutes;

