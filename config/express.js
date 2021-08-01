const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const authRouter = require("../routes/auth");
app.use("/auth", authRouter);

const productsRouter = require("../routes/products");
app.use("/products", productsRouter);

const categoriesRouter = require("../routes/categories");
app.use("/categories", categoriesRouter);

app.use((error, req, res, next) => {
    if(!error) res.status(404).json({ message: "Not Found" });
    console.error(error);
  
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  });
  

module.exports = app;
