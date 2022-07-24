const express = require("express");
const { findByIdAndUpdate } = require("../models/gym.js");
const router = express.Router();
const Gym = require("../models/gym.js");
const methodOverride = require("method-override");
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");

// I believe this is to allow parsing from req.body
router.use(express.urlencoded({ extended: true }));

// override with POST having ?_method=DELETE
router.use(methodOverride("_method"));

// Add gym form
router.get("/new", (req, res) => {
  if (req.session.user_id) {
    res.render("gyms/new");
  } else {
    req.flash("fail", "You need to be logged in to add new gyms");
    res.redirect("/users/login");
  }
});

// All gyms index page
router.get("/index", async (req, res) => {
  const gyms = await Gym.find({}).populate("author");
  res.render("gyms/index", { gyms });
});

// Show gym
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const gym = await Gym.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");
    console.log(gym);
    if (req.session.user_id) {
      const currentUser = await User.findById(req.session.user_id);
      console.log(currentUser);
      res.render("gyms/show", { gym, currentUser });
    } else {
      const currentUser = 0;
      res.render("gyms/show", { gym, currentUser });
    }
  })
);

// Edit gym form
router.get("/:id/edit", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const gym = await Gym.findById(id);
  res.render("gyms/edit", { gym });
});

// Post route for adding a new gym
router.post("/new", async (req, res) => {
  if (req.session.user_id) {
    const gym = new Gym(req.body);
    gym.author = req.session.user_id;
    console.log(gym);
    await gym.save();
    req.flash("success", "Created new gym!");
    res.redirect("/gyms/index");
  } else {
    req.flash("fail", "You must be logged in!");
    res.redirect("/users/login");
  }
});

// Put route for editing a gym
router.put("/:id/edit", async (req, res) => {
  const { id } = req.params;
  const updatedGym = req.body;
  await Gym.findByIdAndUpdate(id, updatedGym);
  req.flash("success", "Successfully edited gym!");
  res.redirect(`/gyms/${id}`);
});

// Deleting gym
router.delete("/:id/delete", async (req, res) => {
  console.log("deleting");
  const { id } = req.params;
  await Gym.findByIdAndDelete(id);
  req.flash("success", "Gym was deleted");
  res.redirect("/gyms/index");
});

// Adding Reviews Post Request
router.post("/:id/reviews/new", async (req, res) => {
  if (req.session.user_id) {
    const { body, rating } = req.body;
    const { id } = req.params;
    const author = req.session.user_id;
    const review = new Review({ body, rating, author });
    await review.save();
    const gym = await Gym.findById(id);
    gym.reviews.push(review);
    await gym.save();
    console.log(gym);
    console.log(review);
    req.flash("success", "Successfully added review!");
    res.redirect(`/gyms/${id}`);
  } else {
    req.flash("fail", "You must be logged in to add a review");
    res.redirect("/users/login");
  }
});

// Deleting Reviews
router.delete("/:id/reviews/:reviewId/delete", async (req, res) => {
  const { id, reviewId } = req.params;
  await Review.findByIdAndDelete(reviewId);
  await Gym.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  req.flash("success", "Review was deleted!");
  res.redirect(`/gyms/${id}`);
});

module.exports = router;
