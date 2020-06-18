const express = require("express");

const { adminMiddleware, requireSignin } = require("../controllers/auth");
const { contactForm, contactBlogAuthorForm } = require("../controllers/form");

const { contactFormValidator } = require("../validators/form");
const { runValidation } = require("../validators/index");
const router = require("./category");

router.post("/contact", contactFormValidator, runValidation, contactForm);
router.post(
  "/contact-blog-author",
  contactFormValidator,
  runValidation,
  contactBlogAuthorForm
);

module.exports = router;
