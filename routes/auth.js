const express = require("express");
const {
  signup,
  signin,
  signout,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");
const { runValidation } = require("../validators/index");
const {
  userSignupValidator,
  userSigninValidator,
  forgotPassworValidator,
  resetPasswordValidator,
} = require("../validators/auth");

const router = express.Router();

router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/signin", userSigninValidator, runValidation, signin);
router.get("/signout", signout);
router.put(
  "/forgot-password",
  forgotPassworValidator,
  runValidation,
  forgotPassword
);

router.put(
  "/reset-password",
  resetPasswordValidator,
  runValidation,
  resetPassword
);

module.exports = router;
