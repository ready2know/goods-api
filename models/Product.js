const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    }
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("Product", productSchema);
