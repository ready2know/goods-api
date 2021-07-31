const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

module.exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new Error("Validation failed, entered data is incorrect...");
    error.statusCode = 422;
    error.data = errors.errors.map((el) => el.msg);
    next(error);
    return;
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
      next(error);
    });
};

module.exports.login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new Error("Validation failed, entered data is incorrect...");
    error.statusCode = 422;
    error.data = errors.errors.map((el) => el.msg);
    next(error);
    return;
  }

  const login = req.body.login;
  const password = req.body.password;

  User.findOne({ login })
    .then(async (user) => {
      if (!user) {
        const error = new Error("A user with this login could not be found...");
        error.statusCode = 422;
        error.data = errors.errors.map((el) => el.msg);
        next(error);
        return;
      }

      const isEqualPassword = await bcrypt.compare(password, user.password);
      if (!isEqualPassword) {
        const error = new Error("Wrong password...");
        error.statusCode = 422;
        next(error);
        return;
      }

      const token = jwt.sign(
        {
          login,
          userId: user._id.toString(),
        },
        "holikovvladislav",
        { expiresIn: "7d" }
      );
        res.status(200).json({token:token, userId:user._id.toString()});
    })
    .catch((err) => {
      console.error(err);
      const error = new Error("Something went wrong...");
      next(error);
    });
};
