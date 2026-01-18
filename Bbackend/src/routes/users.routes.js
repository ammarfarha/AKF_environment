const express = require("express");
const controller = require("../controllers/user.controller");
const { auth, requireRole } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");
const controllerAuth = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const { registerSchema } = require("../validators/auth.validator");
const User = require("../models/user.model");



const router = express.Router();

// Allow all roles except viewer
router.get(
  "/",
  auth,
  requireRole(
    "environmental_specialist",
    "program_manager",
    "project_manager",
    "environmental_focal_point"
  ),
  controller.getAll
);


const guardRegister = asyncHandler(async (req, res, next) => {
  const count = await User.countDocuments();
  if (count === 0) return next();
  return auth(req, res, (err) => {
    if (err) return next(err);
    return requireRole("environmental_specialist")(req, res, next);
  });
});

router.post(
  "/",
  guardRegister,
  validate(registerSchema),
  controllerAuth.register,
);
module.exports = router;

