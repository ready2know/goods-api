const expect = require("chai").expect;
const sinon = require("sinon");

const mongoose = require("mongoose");

const Product = require("../models/Product");
const Category = require("../models/Category");
const ProductsController = require("../controllers/products");

describe("products-controller", function () {
  this.timeout(5000);
  before(function (done) {
    mongoose
      .connect(
        "mongodb+srv://goods-api-admin:verySpecificPassword@cluster0.wmvrf.mongodb.net/goods-api-test?retryWrites=true&w=majority",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: true,
        }
      )
      .then((result) => {
        const category = new Category({
          name: "Классика",
        });
        return category.save();
      })
      .then((result) => {
        const category = new Category({
          name: "Фантастика",
        });
        return category.save();
      })
      .then((result) => {
        const product = new Product({
          name: "Солярис",
        });
        return product.save();
      })
      .then((result) => {
        done();
      })
      .catch((err) => {
        console.error(err);
      });
  });

  describe("Get products list", function () {
    it("Проверка на вывод данных", function (done) {
      const res = {
        json: function (response) {
          this.data = response.data;
          this.status = response.status;
        },
      };

      ProductsController.getProductsList({}, res, (err) => {}).then(() => {
        expect(res).to.have.property("status", "All good");
        expect(res).to.have.property("data");

        done();
      });
    });

    it("Проверка на проброс ошибки если что-то не так с базой", function (done) {
      sinon.stub(Product, "find");
      Product.find.throws();

      ProductsController.getProductsList({}, {}, (err) => {}).then((result) => {
        expect(result).to.be.an("error");
        expect(result.statusCode).to.be.equal(500);
        done();
      });
    });
  });

  describe("Create product", function () {
    it("Проверка при существующем названии", function (done) {
      Product.findOne({}).then((product) => {
        const req = {
          body: {
            name: product.name,
          },
        };
        const res = {
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (response) {
            this.status = response.status;
            this.data = response.data;
          },
        };

        ProductsController.postCreateProduct(req, res, (err) => {}).then(
          (result) => {
            expect(result).to.be.an("error");
            expect(result).to.have.property("statusCode", 422);
            expect(result).to.have.property(
              "message",
              "Product with same name already exists..."
            );
            done();
          }
        );
      });
    });

    it("Проверка при уникальном названии и без категорий", function (done) {
      Product.findOne({}).then((product) => {
        const req = {
          body: {
            name: Date.now(),
            categories: [],
          },
        };
        const res = {
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (response) {
            this.status = response.status;
            this.data = response.data;
          },
        };

        ProductsController.postCreateProduct(req, res, (err) => {}).then(
          (result) => {
            expect(result).to.be.an("error");
            expect(result).to.have.property("statusCode", 422);
            expect(result).to.have.property(
              "message",
              "Categories can't be empty..."
            );
            done();
          }
        );
      });
    });

    it("Проверка при уникальном названии и с валидными категориями", function (done) {
      Category.findOne({}).then((category) => {
        const req = {
          body: {
            name: Date.now(),
            categories: [category._id],
          },
        };

        const res = {
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (response) {
            this.status = response.status;
            this.data = response.data;
            return this;
          },
        };

        ProductsController.postCreateProduct(req, res, (err) => {
          console.log(`next `, err);
        })
          .then((result) => {
            expect(res).to.have.property("statusCode", 201);

            expect(res).to.have.property("status", "All good");

            expect(res).to.have.property("data");
            done();
          })
          .catch((error) => {
            console.log(`then `, error);
          });
      });
    });


    it("Проверка при недоступной базе", function () {
      sinon.stub(Product, "find");
      Product.find.throws();
      const res = {
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (response) {
          this.data = response.data;
          this.status = response.status;
        },
      };

      ProductsController.postCreateProduct({}, res, (err) => {}).then(
        (result) => {
          expect(result).to.be.an("error");
          expect(result.statusCode).to.be.equal(500);

          done();
        }
      );
    });
  });

  afterEach((done) => {
    sinon.restore();
    done();
  });

  after(function (done) {
    Category.deleteMany({})
      .then(() => {
        return Product.deleteMany({});
      })
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      })
      .catch((err) => {
        console.error(err);
      });
  });
});
