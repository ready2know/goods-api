const Product = require("../models/Product");
const Category = require("../models/Category");
const ProductCategory = require("../models/ProductCategory");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongoose").Types;

module.exports.getCategoriesList = async (req, res, next) => {
  try {
    const categoriesList = await Category.find();

    res.json({ status: "All good", data: categoriesList });
  } catch (err) {
    const error = new Error("Something went wrong...");
    error.statusCode = 500;
    next(error);
    return error;
  }
};

module.exports.getCategoryProducts = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;
    const categoryExists = await Category.exists({ _id: categoryId });

    if (!categoryExists) {
      const error = new Error("Category is not exist.");
      error.statusCode = 422;
      throw error;
    }

    const productsId = (
      await ProductCategory.find({ category: categoryId }, "product")
    ).map((el) => el.product.toString());
    const products = await Product.find({
      _id: {
        $in: productsId.map((el) => ObjectId(el)),
      },
    });

    res.json({ status: "All good", data: products });
    return;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
    return error;
  }
};

module.exports.postCreateCategory = async (req, res, next) => {
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
    const categoryName = req.body.name;
    const categoryExists = await Category.exists({ name: categoryName });

    if (categoryExists) {
      const error = new Error("Category name already exists...");
      error.statusCode = 422;
      throw error;
    }

    const category = new Category({ name: categoryName });
    return category
      .save()
      .then((result) => {
        res.status(201).json({
          status: "All good",
          message: "Category successful created...",
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

module.exports.putUpdateCategory = async (req, res, next) => {
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

    const categoryId = req.params.categoryId;
    const categoryName = req.body.name;

    const nameExists = await Category.exists({ name: categoryName });

    if (nameExists) {
      const error = new Error("Category name already exists...");
      error.statusCode = 422;
      throw error;
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      const error = new Error("Category with id is undefined...");
      error.statusCode = 422;
      throw error;
    }
    category.name = categoryName;
    return category.save().then((result) => {
      res.status(201).json({
        status: "All good",
        message: "Category successful updated...",
        data: result,
      });
      return;
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
    return error;
  }
};

module.exports.deleteRemoveCategory = async (req, res, next) => {
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
    const categoryId = req.params.categoryId;

    const category = await Category.findById(categoryId);
    if (!category) {
      const error = new Error("Category is undefined...");
      error.statusCode = 422;
      throw error;
    }

    Category.findByIdAndRemove(categoryId).then((result) => {
      res.status(201).json({
        status: "All good",
        message: "Category successful deleted...",
        data: result,
      });
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
    return error;
  }
};
