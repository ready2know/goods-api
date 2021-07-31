const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");
const { body } = require("express-validator");

const User = require("../models/User");

router.post(
  "/signup",
  [
    body("login")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Login too short")
      .custom(async (value, { req }) => {
        if (await User.exists({ login: value }))
          return Promise.reject("Login already exists.");
      }),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Email not valid")
      .custom(async (value, { req }) => {
        
        if (await User.exists({ email: value }))
          return Promise.reject("E-mail already exists.");
      }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password too short"),
  ],
  authController.signup
);
router.post("/login", 
[
    body("login")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Login too short"),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password too short"),
  ],
  authController.login);

module.exports = router;
