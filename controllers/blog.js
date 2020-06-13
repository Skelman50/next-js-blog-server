const formidable = require("formidable");
const slugify = require("slugify");
const stripHTML = require("string-strip-html");
const _ = require("lodash");
const fs = require("fs");

const Blog = require("../models/blog");
const CAtegory = require("../models/category");
const Tag = require("../models/tag");

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
      res.json({ result });
    } catch (error) {
      res.json({ error: dbErrorHandler(error) });
    }
  });
};
