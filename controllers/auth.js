const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

module.exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      const error = new Error(
        "Validation failed, entered data is incorrect..."
      );
      error.statusCode = 422;
      error.data = errors.errors.map((el) => el.msg);
      throw error;
    }

    const email = req.body.email;
    const login = req.body.login;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({ email, login, password: hashedPassword });

    user
      .save()
      .then((result) => {
        res.status(201).json({
          status: "All good",
          message: "User successful created...",
          userId: result._id,
        });
      })
      .catch((error) => {
        throw error;
      });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
    return error;
  }
};

module.exports.login = async (req, res, next) => {
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

    const login = req.body.login;
    const password = req.body.password;
    try {
      const user = await User.findOne({ login });
      if (!user) {
        const error = new Error("A user with this login could not be found...");
        error.statusCode = 422;
        throw error;
      }

      const isEqualPassword = await bcrypt.compare(password, user.password);
      if (!isEqualPassword) {
        const error = new Error("Wrong password...");
        error.statusCode = 422;
        throw error;
      }

      const token = jwt.sign(
        {
          login,
          userId: user._id.toString(),
        },
        "holikovvladislav",
        { expiresIn: "7d" }
      );

      res
        .status(200)
        .json({ token: token.toString(), userId: user._id.toString() });
      return null;
    } catch (error) {
      throw error;
    }
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
    return error;
  }
};
