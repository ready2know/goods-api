const expect = require("chai").expect;
const sinon = require("sinon");

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/User");
const AuthController = require("../controllers/auth");

describe("auth-controller", function () {
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
        const user = new User({
          email: "test@mail.com",
          login: "testUser",
          password: await bcrypt.hash("testPassword", 12),
        });
        return user.save();
      })
      .then((result) => {
        done();
      })
      .catch((err) => {
        console.error(err);
      });
  });

  describe("login", function () {
    it("Проверка на правильный ввод данных", function (done) {
      const req = {
        body: {
          login: "testUser",
          password: "testPassword",
        },
      };
      const res = {
        statusCode: 500,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.token = data.token;
          this.userId = data.userId;
          return this;
        },
      };

      AuthController.login(req, res, (err) => {
        console.log(err);
      }).then(() => {
        expect(res).to.have.property("token");
        expect(res).to.have.property("userId");

        done();
      });
    });

    it("Проверка на несуществующий логин", function (done) {
      const req = {
        body: {
          login: "testUser2",
          password: "testPassword",
        },
      };
      const res = {
        statusCode: 500,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.token = data.token;
          this.userId = data.userId;
          return this;
        },
      };

      AuthController.login(req, res, (err) => {}).then((result) => {
        expect(result).to.be.an("error");
        expect(result).to.have.property("statusCode", 422);
        expect(result).to.have.property(
          "message",
          "A user with this login could not be found..."
        );
        done();
        
      }).catch((err) => {
        throw err;
      });
    });

    it("Проверка на неправильный пароль", function (done) {
      const req = {
        body: {
          login: "testUser",
          password: "testPassword2",
        },
      };
      const res = {
        statusCode: 500,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.token = data.token;
          this.userId = data.userId;
          return this;
        },
      };

      AuthController.login(req, res, (err) => {}).then((result) => {
        expect(result).to.be.an("error");
        expect(result).to.have.property("statusCode", 422);
        expect(result).to.have.property(
          "message",
          "Wrong password..."
        );
        done();
        
      }).catch((err) => {
        throw err;
      });
    });

    it("Ошибка на недоступность бд с кодом 500", function (done) {
      sinon.stub(User, "findOne");
      User.findOne.throws();

      const req = {
        body: {
          login: "testUser2",
          password: "testPassword",
        },
      };

      AuthController.login(req, {}, () => {}).then((result) => {
        expect(result).to.be.an("error");
        expect(result).to.have.property("statusCode", 500);
        done();
      });
    });
  });

  afterEach((done) => {
    sinon.restore();
    done();
  });

  after(function (done) {
    User.deleteMany({})
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
