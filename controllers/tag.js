const Tag = require("../models/tag");
const slugify = require("slugify");
const { dbErrorHandler } = require("../helpers/dbErrorHandler");

exports.create = async (req, res) => {
  const { name } = req.body;
  const slug = slugify(name).toLowerCase();
  try {
    const data = await Tag.create({ name, slug });
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: dbErrorHandler(error) });
  }
};

exports.list = async (req, res) => {
  try {
    const tags = await Tag.find({});
    res.json(tags);
  } catch (error) {
    res.status(400).json({ error: dbErrorHandler(error) });
  }
};

exports.read = async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  try {
    const tag = await Tag.findOne({ slug });
    res.json(tag);
  } catch (error) {
    res.status(400).json({ error: dbErrorHandler(error) });
  }
};

exports.remove = async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  try {
    await Tag.findOneAndDelete({ slug });
    res.json({ message: "Tag delete successfully!" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: dbErrorHandler(error) });
  }
};
