const { check } = require("express-validator");

exports.userSignupValidator = [
  check("name").not().isEmpty().withMessage("Name is reuired"),
  check("email").isEmail().withMessage("Must be a valid email"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Passwort must be at least 6 characters long"),
];

exports.userSigninValidator = [
  check("email").isEmail().withMessage("Must be a valid email"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Passwort must be at least 6 characters long"),
];
