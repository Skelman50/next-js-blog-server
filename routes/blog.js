const express = require("express");
const { requireSignin, adminMiddleware } = require("../controllers/auth");
const {
  create,
  list,
  listAllBlogsCategoriesTags,
  read,
  remove,
  update,
  photo,
  listRelated,
} = require("../controllers/blog");

const router = express.Router();

router.post("/", requireSignin, adminMiddleware, create);
router.get("/", list);
router.get("/categories-tags", listAllBlogsCategoriesTags);
router.get("/photo/:slug", photo);
router.post("/related", listRelated);
router.get("/:slug", read);
router.delete("/:slug", requireSignin, adminMiddleware, remove);
router.put("/:slug", requireSignin, adminMiddleware, update);

module.exports = router;
