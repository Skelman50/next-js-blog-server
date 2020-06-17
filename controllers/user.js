const _ = require("lodash");
const formidable = require("formidable");
const fs = require("fs");

const User = require("../models/user");
const Blog = require("../models/blog");

const { dbErrorHandler } = require("../helpers/dbErrorHandler");

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  return res.json(req.profile);
};

exports.publicProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select(
      "-photo -hashed_password -salt"
    );
    if (!user) {
      throw new Error();
    }
    const blogs = await Blog.find({ postedBy: user._id })
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name")
      .limit(10)
      .select(
        "_id title slug exerpt categories tags postedBy createdAt updatedAt"
      );
    res.json({ user, blogs });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "User not found" });
  }
};

exports.update = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Photo could not be upload!" });
    }
    const user = _.extend(req.profile, fields);
    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res
          .status(400)
          .json({ error: "Image should be less than 1mb!" });
      }
      user.photo.data = fs.readFileSync(files.photo.path);
      user.photo.contentType = files.photo.type;
      try {
        const updatedUser = await user.save();
        delete user.hashed_password;
        delete user.salt;
        res.json(updatedUser);
      } catch (error) {
        res.status(400).json({ error: dbErrorHandler(error) });
      }
    }
  });
};

exports.photo = async (req, res) => {
  const { username } = req.params;
  try {
    const user = User.findOne({ username });
    if (!user) {
      throw new Error();
    }
    if (user.photo.data) {
      res.set("Content-Type", user.photo.contentType);
      res.send(user.photo.data);
    }
  } catch (error) {
    res.status(404).json({ error: "User not found!" });
  }
};
