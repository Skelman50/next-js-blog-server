const { check } = require("express-validator");

exports.contactFormValidator = [
  check("name").not().isEmpty().withMessage("Name is reuired!"),
  check("email").isEmail().withMessage("Must be a valid email!"),
  check("message")
    .not()
    .isEmpty()
    .isLength({ min: 20 })
    .withMessage("Message must be least 20 characters long!"),
];
