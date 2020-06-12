const Category = require("../models/category");
const slugify = require("slugify");

exports.create = async (req, res) => {
  const { name } = req.body;
  const slug = slugify(name).toLowerCase();
  try {
    const data = await Category.create({ name, slug });
    res.json(data);
  } catch (error) {
    res.status(400).json({ error });
  }
};
