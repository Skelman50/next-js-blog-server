const User = require("../models/user");
const shortId = require("shortid");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

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
    const user = await User.findById(authUserId);
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
    const user = await User.findById(adminUserId);
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
