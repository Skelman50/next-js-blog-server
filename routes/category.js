const express = require("express");

const { adminMiddleware, requireSignin } = require("../controllers/auth");

const { categoryCreateValidator } = require("../validators/category");
const { runValidation } = require("../validators/index");

const { create } = require("../controllers/category");

const router = express.Router();

router.post(
  "/",
  categoryCreateValidator,
  runValidation,
  requireSignin,
  adminMiddleware,
  create
);

module.exports = router;
