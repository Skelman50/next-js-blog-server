const express = require("express");

const { adminMiddleware, requireSignin } = require("../controllers/auth");

const { tagCreateValidator } = require("../validators/tag");
const { runValidation } = require("../validators/index");

const { create, list, read, remove } = require("../controllers/tag");

const router = express.Router();

router.post(
  "/",
  tagCreateValidator,
  runValidation,
  requireSignin,
  adminMiddleware,
  create
);

router.get("/", list);
router.get("/:slug", read);
router.delete("/:slug", requireSignin, adminMiddleware, remove);

module.exports = router;
