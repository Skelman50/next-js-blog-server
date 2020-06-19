const shortId = require("shortid");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const sgMail = require("@sendgrid/mail");
const _ = require("lodash");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const User = require("../models/user");
const Blog = require("../models/blog");
const { dbErrorHandler } = require("../helpers/dbErrorHandler");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "Email is taken" });
    }

    const username = shortId.generate();
    const profile = `${process.env.CLIENT_URL}/profile/${username}`;
    await User.create({
      name,
      email,
      password,
      profile,
      username,
    });
    // res.json({ user: newUser });
    res.json({ message: "Signup success. Please Signin!" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ error: "User not found. Please, signup!" });
    }

    if (!user.authenticate(req.body.password)) {
      return res.status(404).json({ error: "Email and password do not match" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, { expiresIn: "1d" });
    const { _id, username, name, email, role } = user;
    res.json({ user: { _id, username, name, email, role }, token });
  } catch (error) {}
};

exports.signout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Signout success" });
};

exports.requireSignin = expressJwt({ secret: process.env.JWT_SECRET });

exports.authMiddleware = async (req, res, next) => {
  const authUserId = req.user.id;

  try {
    const user = await await User.findById(authUserId).select(
      "-photo -salt -hashed_password"
    );

    if (!user) {
      throw new Error();
    }
    req.profile = user;
    next();
  } catch (error) {
    res.status(400).json({ error: "User not found" });
  }
};

exports.adminMiddleware = async (req, res, next) => {
  const adminUserId = req.user.id;
  try {
    const user = await User.findById(adminUserId).select(
      "-photo -salt -hashed_password"
    );

    if (!user) {
      throw new Error();
    }

    if (user.role !== 1) {
      return res.status(400).json({ error: "Admin resource. Access danied!" });
    }
    req.profile = user;
    next();
  } catch (error) {
    res.status(400).json({ error: "User not found" });
  }
};

exports.canUpdateDeleteBlog = async (req, res, next) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const blog = await Blog.findOne({ slug });
    const authorized =
      blog.postedBy._id.toString() === req.profile._id.toString();
    if (!authorized) {
      return res.status(403).json({ error: "You are not authorized!" });
    }
    next();
  } catch (error) {
    res.status(400).json({ error: dbErrorHandler(error) });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error();
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: "10m",
    });
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Password reset link`,
      html: `
          <p>Please use this link to reset ypur password:</p>
          <a href=${process.env.CLIENT_URL}/auth/password/reset/${token} target="blank">
            ${process.env.CLIENT_URL}/auth/password/reset/${token}
          </a>
          <hr/>
          <p>This email may contain secsetive information!</p>
          <p>https://seoblog.com</p>
      `,
    };
    await user.updateOne({ resetPasswordLink: token });
    await sgMail.send(emailData);
    res.json({ message: `Email has been send to ${email}` });
  } catch (error) {
    res.status(404).json({ error: "User not found!" });
  }
};

exports.resetPassword = async (req, res) => {
  const { resetPasswordLink, password } = req.body;

  try {
    var decoded = await jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD
    );
  } catch (error) {
    return res.status(401).json({ error: "Expired link. Try again!" });
  }
  try {
    let user = await User.findById(decoded.id);
    if (
      !user ||
      user.resetPasswordLink.toString() !== resetPasswordLink.toString()
    ) {
      throw new Error();
    }
    const updateFields = { password, resetPasswordLink: "" };
    user = _.extend(user, updateFields);
    await user.save();
    res.json({ message: "Great. Now you can login with your new password!" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "Something went wrong. Try again!" });
  }
};
