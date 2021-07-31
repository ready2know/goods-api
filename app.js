const express = require("express");
const app = express();

const MONGODB_URI =
  "mongodb+srv://goods-api-admin:verySpecificPassword@cluster0.wmvrf.mongodb.net/goods-api?retryWrites=true&w=majority";
const mongoose = require("mongoose");

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

const productsRouter = require("./routes/products");
app.use("/products", productsRouter);

const categoriesRouter = require("./routes/categories");
app.use("/categories", categoriesRouter);

app.use((error, req, res, next) => {
  if(!error) res.status(404).json({ message: "Not Found" });
  console.error(error);

  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  })
  .then((result) => {
    const listener = app.listen(process.env.PORT || 3001, () => {
      console.log(`Server listen on ${listener.address().port}`);
    });
  })
  .catch((err) => console.log(err));
