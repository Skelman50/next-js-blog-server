require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { connectDB } = require("./config/db");
const blogRoutes = require("./routes/blog");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const app = express();

app.use(morgan("dev"));

app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(cors({ origin: process.env.CLIENT_URL }));
}

app.use("/api/blog", blogRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT;

const listenServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`server start on port ${PORT}`);
  });
};

listenServer();
