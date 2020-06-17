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
    const user = await User.findOne({ username }).select("-photo");
    if (!user) {
      throw new Error();
    }
    const blogs = await Blog.find({ postedBy: user._id })
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name")
      .limit(10)
      .select(
        "_id name slug exerpt categories tags postedBy createdAt updatedAt"
      );
    res.json({ user, blogs });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "User not found" });
  }
};
