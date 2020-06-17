const express = require("express");
const { requireSignin, authMiddleware } = require("../controllers/auth");
const { read, publicProfile } = require("../controllers/user");

const router = express.Router();

router.get("/profile", requireSignin, authMiddleware, read);
router.get("/:username", publicProfile);

module.exports = router;
