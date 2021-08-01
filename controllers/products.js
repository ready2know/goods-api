const Product = require("../models/Product");
const Category = require("../models/Category");
const ProductCategory = require("../models/ProductCategory");

const { ObjectId } = require("mongoose").Types;
const { validationResult } = require("express-validator");

async function setCategories(productId, categories) {
  try {
    if (!productId || !categories) return;
    const updateCategories = Array.from(new Set(categories));
    const existingCategories = (
      await Category.find(
        {
          _id: {
            $in: updateCategories.map((el) => ObjectId(el)),
          },
        },
        "_id"
      )
    ).map((el) => el._id.toString());

    if (existingCategories.length !== updateCategories.length) {
      const error = new Error("Validation failed, categories is not valid...");
      error.statusCode = 422;
      throw error;
    }
    const currentCategories = (
      await ProductCategory.find(
        {
          product: productId,
        },
        "category"
      )
    ).map((el) => el.category.toString());

    const categoriesRemove = currentCategories.filter(
      (el) => !updateCategories.includes(el.toString())
    );
    const categoriesAdd = updateCategories.filter((el) => {
      return !currentCategories.includes(el.toString());
    });

    await ProductCategory.deleteMany({
      category: {
        $in: categoriesRemove.map((el) => ObjectId(el)),
      },
      product: productId,
    });

    await ProductCategory.create(
      categoriesAdd.map((el) => {
        return new Object({ category: ObjectId(el), product: productId });
      })
    );

    return existingCategories;
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }
}

module.exports.getProductsList = async (req, res, next) => {
  try {
    const productsList = await Product.find({}, "_id name");
    res.json({ status: "All good", data: productsList });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
    return error;
  }
};

module.exports.postCreateProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(
        "Validation failed, entered data is incorrect..."
      );
      error.statusCode = 422;
      error.data = errors.errors.map((el) => el.msg);
      throw error;
    }
    const productName = req.body.name;
    const productCategories = req.body.categories;
    const productExists = await Product.exists({ name: productName });

    if (productExists) {
      const error = new Error("Product with same name already exists...");
      error.statusCode = 422;
      throw error;
    }
    if (!productCategories || productCategories.length < 1) {
      const error = new Error("Categories can't be empty...");
      error.statusCode = 422;
      throw error;
    }

    const product = new Product({ name: productName });
    return product
      .save()
      .then(async (result) => {
        const productId = result._id;
        result.categories = await setCategories(
          productId,
          productCategories
        ).catch((error) => {
          throw error;
        });
        return result;
      })
      .then((result) => {
        res.status(201).json({
          status: "All good",
          message: "Product successful created...",
          data: result,
        });
      })
      .catch((error) => {
        throw error;
      });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
    return error;
  }
};

module.exports.putUpdateProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(
        "Validation failed, entered data is incorrect..."
      );
      error.statusCode = 422;
      error.data = errors.errors.map((el) => el.msg);
      throw error;
    }

    const updateName = req.body.name;
    const updateCategories = req.body.categories;

    const productId = ObjectId(req.params.productId);

    const sameNameExists = await Product.exists({
      _id: { $ne: productId },
      name: updateName,
    });

    if (sameNameExists) {
      const error = new Error("Product with same name already exists...");
      error.statusCode = 422;
      throw error;
    }

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product don't exists...");
      error.statusCode = 422;
      throw error;
    }

    product.name = updateName;

    product
      .save()
      .then(async (result) => {
        result.categories = await setCategories(productId, updateCategories);
        return result;
      })
      .then((result) => {
        res.status(201).json({
          status: "All good",
          message: "Product successful created...",
          data: result,
        });
      })
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        throw error;
      });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
    return error;
  }
};

module.exports.deleteRemoveProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(
        "Validation failed, entered data is incorrect..."
      );
      error.statusCode = 422;
      error.data = errors.errors.map((el) => el.msg);
      throw error;
    }

    const productId = req.params.productId;
    try {
      const product = await Product.findById(productId);
      if (!product) {
        const error = new Error("Product is don't exists...");
        error.statusCode = 422;
        throw error;
      }

      Product.findByIdAndRemove(productId)
        .then(async (result) => {
          result.categories = await setCategories(productId, []);
          return result;
        })
        .then((result) => {
          res.status(201).json({
            status: "All good",
            message: "Product successful deleted...",
            data: result,
          });
        });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
    return error;
  }
};
