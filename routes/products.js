const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const productsController = require("../controllers/products");
const isAuth = require("../middlewares/is-auth");

router.get("/", productsController.getProductsList);


// POST /product/createproduct
router.post(
  "/createProduct",
  isAuth,
  [
    body("name").trim().isLength({ min: 1 }).withMessage('name must be at least 1 char long'),
  ],
  productsController.postCreateProduct
);

// PUT /product/updateproduct
router.put(
  "/updateProduct/:productId",
  isAuth,
  [
    param("productId").trim().isLength({min:24, max:24}).withMessage('Identifier must be 24 char long'),
    body("name").trim().isLength({ min: 1 }).withMessage('name must be at least 1 char long')
  ],
  productsController.putUpdateProduct
);

router.delete(
  "/deleteProduct/:productId",
  isAuth,
  [
    param("productId").trim().isLength({min:24, max:24}).withMessage('Identifier must be 24 char long'),
  ],
  productsController.deleteRemoveProduct
);


module.exports = router;
