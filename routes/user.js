const express = require("express");
const { requireSignin, authMiddleware } = require("../controllers/auth");
const { read, publicProfile, update, photo } = require("../controllers/user");

const router = express.Router();

router.get("/profile", requireSignin, authMiddleware, read);
router.get("/:username", publicProfile);
router.put("/update", requireSignin, authMiddleware, update);
router.get("/update/:username", photo);

module.exports = router;
