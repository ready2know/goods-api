const MONGODB_URI =
  "mongodb+srv://goods-api-admin:verySpecificPassword@cluster0.wmvrf.mongodb.net/goods-api?retryWrites=true&w=majority";
const mongoose = require("mongoose");

module.exports.connect = mongoose.connect.bind(this, MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
});

module.exports.mongoose = mongoose;