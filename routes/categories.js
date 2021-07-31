const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const categoriesController = require("../controllers/categories");
const isAuth = require("../middlewares/is-auth");

router.get("/", categoriesController.getCategoriesList);

router.get("/:categoryId", categoriesController.getCategoryProducts);


// POST /category/createCategory
router.post(
  "/createCategory",
  isAuth,
  [
    body("name").trim().isLength({ min: 1 }).withMessage('name must be at least 1 char long')
  ],
  categoriesController.postCreateCategory
);

// PUT /category/updateCategory
router.put(
  "/updateCategory/:categoryId",
  isAuth,
  [
    param("categoryId").trim().isLength({min:24}).withMessage('Identifier must be 24 char long'),
    body("name").trim().isLength({ min: 1 }).withMessage('name must be at least 1 char long')
  ],
  categoriesController.putUpdateCategory
);

router.delete(
  "/deleteCategory/:categoryId",
  isAuth,
  [
    param("categoryId").trim().isLength({min:24}).withMessage('Identifier must be 24 char long'),
    body("name").trim().isLength({ min: 1 }).withMessage('name must be at least 1 char long')
  ],
  categoriesController.deleteRemoveCategory
);


module.exports = router;
