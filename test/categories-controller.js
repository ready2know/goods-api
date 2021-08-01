const expect = require("chai").expect;
const sinon = require("sinon");

const mongoose = require("mongoose");

const Category = require("../models/Category");
const CategoriesController = require("../controllers/categories");

describe("categories-controller", function () {
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
      .then(async (result) => {
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
        done();
      })
      .catch((err) => {
        console.error(err);
      });
  });

  describe("Get categories list", function () {
    it("Проверка на вывод данных", function (done) {
      const res = {
        json: function (response) {
          this.data = response.data;
          this.status = response.status;
        },
      };

      CategoriesController.getCategoriesList({}, res, (err) => {}).then(() => {
        expect(res).to.have.property("status", "All good");
        expect(res).to.have.property("data");

        done();
      });
    });
    it("Проверка на проброс ошибки если что-то не так с базой", function (done) {
      sinon.stub(Category, "find");
      Category.find.throws();
      const res = {
        json: function (response) {
          this.data = response.data;
          this.status = response.status;
        },
      };

      CategoriesController.getCategoriesList({}, res, (err) => {}).then(
        (result) => {
          expect(result).to.be.an("error");
          expect(result.statusCode).to.be.equal(500);

          done();
        }
      );
    });
  });

  describe("Get category products", function () {
    it("Проверка при правильном идентификаторе", function (done) {
      Category.findOne({}).then((category) => {
        const req = {
          params: {
            categoryId: category._id,
          },
        };
        const res = {
          json: function (response) {
            this.status = response.status;
            this.data = response.data;
          },
        };

        CategoriesController.getCategoryProducts(req, res, () => {}).then(
          () => {
            expect(res).to.have.property("status", "All good");
            expect(res).to.have.property("data");
            done();
          }
        );
      });
    });

    it("Проверка при неправильном идентификаторе", function (done) {
      const req = {
        params: {
          categoryId: "234",
        },
      };
      const res = {
        json: function (response) {
          this.status = response.status;
          this.data = response.data;
        },
      };

      CategoriesController.getCategoryProducts(req, res, (err) => {}).then(
        (result) => {
          expect(result).to.be.an("error");
          expect(result).to.satisfy((data) => {
            return data.statusCode === 422 || data.statusCode === 500;
          });
          done();
        }
      );
    });

    it("Проверка при недоступной базе", function () {
      sinon.stub(Category, "find");
      Category.find.throws();
      const res = {
        json: function (response) {
          this.data = response.data;
          this.status = response.status;
        },
      };

      CategoriesController.getCategoryProducts({}, res, (err) => {}).then(
        (result) => {
          expect(result).to.be.an("error");
          expect(result.statusCode).to.be.equal(500);

          done();
        }
      );
    });
  });

  describe("Create category", function () {
    it("Проверка при существующем названии", function (done) {
      Category.findOne({}).then((category) => {
        const req = {
          body: {
            name: category.name,
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

        CategoriesController.postCreateCategory(req, res, (err) => {}).then(
          (result) => {
            expect(result).to.be.an("error");
            expect(result).to.have.property("statusCode", 422);
            expect(result).to.have.property(
              "message",
              "Category name already exists..."
            );
            done();
          }
        );
      });
    });

    it("Проверка при несуществующем названии", function (done) {
      const req = {
        body: {
          name: Date.now().toString(),
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

      CategoriesController.postCreateCategory(req, res, (err) => {}).then(
        (result) => {
          expect(res).to.have.property("statusCode", 201);

          expect(res).to.have.property("status", "All good");

          expect(res).to.have.property("data");
          done();
        }
      );
    });

    it("Проверка при недоступной базе", function () {
      sinon.stub(Category, "find");
      Category.find.throws();
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

      CategoriesController.postCreateCategory({}, res, (err) => {}).then(
        (result) => {
          expect(result).to.be.an("error");
          expect(result.statusCode).to.be.equal(500);

          done();
        }
      );
    });
  });

  describe("Update category", function () {
    it("Проверка при существующем названии", function (done) {
      Category.findOne({}).then((category) => {
        const req = {
          params: {
            categoryId: category._id,
          },
          body: {
            name: category.name,
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

        CategoriesController.putUpdateCategory(req, res, (err) => {}).then(
          (result) => {
            expect(result).to.be.an("error");
            expect(result).to.have.property("statusCode", 422);
            expect(result).to.have.property(
              "message",
              "Category name already exists..."
            );
            done();
          }
        );
      });
    });

    it("Проверка при правильном идентификаторе и названии", function (done) {
      Category.findOne({}).then((category) => {
        const req = {
          params: {
            categoryId: category._id,
          },
          body: {
            name: Date.now().toString(),
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

        CategoriesController.putUpdateCategory(req, res, (err) => {}).then(
          () => {
            expect(res).to.have.property("statusCode", 201);
            expect(res).to.have.property("status", "All good");
            expect(res).to.have.property("data");
            done();
          }
        );
      });
    });

    it("Проверка при неправильном идентификаторе", function (done) {
      const req = {
        params: {
          categoryId: "1234",
        },
        body: {
          name: Date.now().toString(),
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

      CategoriesController.putUpdateCategory(req, res, (err) => {}).then(
        (result) => {
          expect(result).to.be.an("error");
          expect(result).to.satisfy((data) => {
            return data.statusCode === 422 || data.statusCode === 500;
          });
          done();
        }
      );
    });

    it("Проверка при недоступной базе", function () {
      sinon.stub(Category, "find");
      Category.find.throws();
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

      CategoriesController.putUpdateCategory({}, res, (err) => {}).then(
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
