const formidable = require("formidable");
const slugify = require("slugify");
const stripHTML = require("string-strip-html");
const _ = require("lodash");
const fs = require("fs");

const Blog = require("../models/blog");
const CAtegory = require("../models/category");
const Tag = require("../models/tag");
const User = require("../models/user");

const { dbErrorHandler } = require("../helpers/dbErrorHandler");
const { smartTrim } = require("../helpers/blog");

exports.create = (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (error, fields, files) => {
    if (error) {
      return res.status(400).json({ error: "Image could not upload" });
    }

    const { body, title, categories, tags } = fields;
    if (!title || !title.length) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!body || body.length < 200) {
      return res.status(400).json({ error: "Content is too short!" });
    }

    if (!categories || categories.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one category is required!" });
    }

    if (!tags || tags.length === 0) {
      return res.status(400).json({ error: "At least one tag is required!" });
    }

    const categoriesArray = categories && categories.split(",");
    const tagsArray = tags && tags.split(",");
    const blog = new Blog();
    blog.title = title;
    blog.body = body;
    blog.slug = slugify(title).toLowerCase();
    blog.mtitle = `${title} | ${process.env.APP_NAME}`;
    blog.mdesc = stripHTML(body.substring(0, 160));
    blog.postedBy = req.user.id;
    blog.exerpt = smartTrim(body, 320, " ", " ...");
    blog.categories = categoriesArray;
    blog.tags = tagsArray;
    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res
          .status(400)
          .json({ error: "Image should be less then 1mb in size" });
      }
      blog.photo.data = fs.readFileSync(files.photo.path);
      blog.photo.contentType = files.photo.type;
    }
    try {
      const result = await blog.save();
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: dbErrorHandler(error) });
    }
  });
};

exports.list = async (req, res) => {
  try {
    const blogs = await Blog.find({})
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name username")
      .select(
        "_id title slug exerpt categories tags postedBy createdAt updatedAt"
      );
    res.json(blogs);
  } catch (error) {
    res.status(400).json({ error: dbErrorHandler(error) });
  }
};

exports.listAllBlogsCategoriesTags = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const skip = req.query.skip ? parseInt(req.query.skip) : 0;

  try {
    const blogs = await Blog.find({})
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name username")
      .sort({ createAt: -1 })
      .limit(limit)
      .skip(skip)
      .select(
        "_id title slug exerpt categories tags postedBy createdAt updatedAt"
      );
    const categories = await CAtegory.find({});
    const tags = await Tag.find({});
    res.json({ blogs, categories, tags, size: blogs.length });
  } catch (error) {
    res.status(400).json({ error: dbErrorHandler(error) });
  }
};

exports.read = async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  try {
    const blog = await Blog.findOne({ slug })
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name username")
      .select(
        "_id title slug body mtitle mdesc categories tags postedBy createdAt updatedAt"
      );
    res.json(blog);
  } catch (error) {
    res.status(400).json({ error: dbErrorHandler(error) });
  }
};

exports.remove = async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  try {
    await Blog.findOneAndDelete({ slug });
    res.json({ message: "Blog delete successfully!" });
  } catch (error) {
    res.status(400).json({ error: dbErrorHandler(error) });
  }
};

exports.update = async (req, res) => {
  const slug = req.params.slug.toLowerCase();

  let oldBlog = await Blog.findOne({ slug });

  if (!oldBlog) {
    return res.status(404).json({ error: "Can't update empty blog!" });
  }
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (error, fields, files) => {
    if (error) {
      return res.status(400).json({ error: "Image could not upload!" });
    }

    const slugBeforeMerge = oldBlog.slug;
    oldBlog = _.merge(oldBlog, fields);
    oldBlog.slug = slugBeforeMerge;
    const { body, categories, tags } = fields;
    if (body) {
      oldBlog.exerpt = smartTrim(body, 320, " ", " ...");
      oldBlog.mdesc = stripHTML(body.substr(0, 160));
    }

    if (categories) {
      oldBlog.categories = categories.split(",");
    }

    if (tags) {
      oldBlog.tags = tags.split(",");
    }

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res
          .status(400)
          .json({ error: "Image should be less then 1mb in size" });
      }
      oldBlog.photo.data = fs.readFileSync(files.photo.path);
      oldBlog.photo.contentType = files.photo.type;
    }
    try {
      const result = await oldBlog.save();
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: dbErrorHandler(error) });
    }
  });
};

exports.photo = async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  try {
    const blogPhoto = await Blog.findOne({ slug }).select("photo");
    res.set("Content-Type", blogPhoto.photo.contentType);
    res.send(blogPhoto.photo.data);
  } catch (error) {
    res.status(400).json({ error: dbErrorHandler(error) });
  }
};

exports.listRelated = async (req, res) => {
  const limit = req.body.limit ? parseInt(req.body.limit) : 3;
  const {
    blog: { _id, categories },
  } = req.body;
  try {
    const data = await Blog.find({
      _id: { $ne: _id },
      categories: { $in: categories },
    })
      .limit(limit)
      .populate("postedBy", "_id name profile username")
      .select("_id title slug postedBy exerpt createdAt updatedAt");
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: dbErrorHandler(error) });
  }
};

exports.search = async (req, res) => {
  const { search } = req.query;
  if (search) {
    try {
      const blogs = await Blog.find({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { body: { $regex: search, $options: "i" } },
        ],
      }).select("-photo -body");

      res.json(blogs);
    } catch (error) {
      res.status(400).json({ error: dbErrorHandler(error) });
    }
  } else {
    res.json([]);
  }
};

exports.listByUser = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    const blogs = Blog.find({ postedBy: user._id })
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name username ")
      .select("_id title slug postedBy createdAt updatedAt");
    res.json(blogs);
  } catch (error) {
    res.status(400).json({ error: dbErrorHandler(error) });
  }
};
