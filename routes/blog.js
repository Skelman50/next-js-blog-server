const express = require("express");
const {
  requireSignin,
  adminMiddleware,
  authMiddleware,
  canUpdateDeleteBlog,
} = require("../controllers/auth");
const {
  create,
  list,
  listAllBlogsCategoriesTags,
  read,
  remove,
  update,
  photo,
  listRelated,
  search,
  listByUser,
} = require("../controllers/blog");

const router = express.Router();

router.post("/", requireSignin, adminMiddleware, create);
router.get("/", list);
router.get("/categories-tags", listAllBlogsCategoriesTags);
router.get("/photo/:slug", photo);
router.post("/related", listRelated);
router.get("/search", search);
router.get("/:slug", read);
router.delete("/:slug", requireSignin, adminMiddleware, remove);
router.put("/:slug", requireSignin, adminMiddleware, update);

router.delete(
  "/:slug/user",
  requireSignin,
  authMiddleware,
  canUpdateDeleteBlog,
  remove
);
router.put(
  "/:slug/user",
  requireSignin,
  authMiddleware,
  canUpdateDeleteBlog,
  update
);
router.post("/user", requireSignin, authMiddleware, create);
router.get("/:username/list", listByUser);

module.exports = router;
