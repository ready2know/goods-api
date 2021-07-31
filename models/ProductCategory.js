const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productCategorySchema = new Schema(
  {
    product: {
      type: mongoose.Types.ObjectId,
      require: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      require: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("ProductCategory", productCategorySchema);
