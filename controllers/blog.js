exports.time = async (req, res) => {
  res.json({ time: Date().toString() });
};
