const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

// I believe this is to allow parsing from req.body
router.use(express.urlencoded({ extended: true }));

// Sets up the static directory.
// To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express.
// So you have to declare the folder of your static files.
router.use(express.static("assets"));

router.get("/login", (req, res) => {
  if (req.session.user_id) {
    req.flash("fail", "You are already logged in!");
    res.redirect("/users/account");
  } else {
    res.render("users/login");
  }
});

router.get("/account", async (req, res) => {
  if (!req.session.user_id) {
    req.flash("fail", "You must be logged in to view account!");
    res.redirect("/users/login");
  } else {
    const user = await User.findById(req.session.user_id);
    console.log(user);
    res.render("users/account", { user });
  }
});

router.get("/signup", (req, res) => {
  res.render("users/signup");
});

// Post request from the signup form
router.post("/signup", async (req, res) => {
  const { email, username, password } = req.body;
  const userExists = await User.exists({ username: username });
  const emailExists = await User.exists({ email: email });
  if (!userExists && !emailExists) {
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      email: email,
      username: username,
      password: hashPassword,
    });
    console.log(newUser);
    await newUser.save();
    req.flash("success", "Registration Successful! Welcome to Gym Reviewer!");
    res.redirect("/users/login");
  } else {
    req.flash("fail", "Registration failed. Username or email already exists!");
    res.redirect("/users/signup");
  }
});

// Post request from the login form.
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(username);
  const user = await User.findOne({ username: username });
  if (user) {
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      req.session.user_id = user._id;
      req.flash("success", "Successfully logged in!");
      res.redirect("/users/account");
    } else {
      console.log("result failed");
      req.flash("fail", "Incorrect username or password");
      res.redirect("/users/login");
    }
  } else {
    console.log("user failed");
    req.flash("fail", "Incorrect username or password");
    res.redirect("/users/login");
  }
});

// Post request for signing out
router.post("/signout", async (req, res) => {
  req.session.user_id = null;
  req.flash("success", "Successfully signed out!");
  res.redirect("/users/login");
});

module.exports = router;
