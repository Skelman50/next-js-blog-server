const express = require("express");
const { requireSignin, adminMiddleware } = require("../controllers/auth");
const { create } = require("../controllers/blog");

const router = express.Router();

router.post("/", requireSignin, adminMiddleware, create);

module.exports = router;
