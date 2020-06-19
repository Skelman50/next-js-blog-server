const express = require("express");
const {
  signup,
  signin,
  signout,
  forgotPassword,
  resetPassword,
  preSignup,
} = require("../controllers/auth");
const { runValidation } = require("../validators/index");
const {
  userSignupValidator,
  userSigninValidator,
  forgotPassworValidator,
  activateAccountValidator,
  resetPasswordValidator,
} = require("../validators/auth");

const router = express.Router();

router.post("/signup", activateAccountValidator, runValidation, signup);
router.post("/pre-signup", userSignupValidator, runValidation, preSignup);
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
