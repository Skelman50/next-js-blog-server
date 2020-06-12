const express = require("express");
const {
  signup,
  signin,
  requireSignin,
  signout,
} = require("../controllers/auth");
const { runValidation } = require("../validators/index");
const {
  userSignupValidator,
  userSigninValidator,
} = require("../validators/auth");

const router = express.Router();

router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/signin", userSigninValidator, runValidation, signin);
router.get("/signout", signout);

router.get("/secret", requireSignin, (req, res) => {
  res.json({ secret: req.user });
});

module.exports = router;
