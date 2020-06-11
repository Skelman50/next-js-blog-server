const mongoose = require("mongoose");

exports.connectDB = async () => {
  await mongoose.connect(process.env.DATABASE_CLOUD, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });
  console.log("db connect");
};
