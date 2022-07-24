const express = require("express");
const path = require("path");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const wrapAsync = require("./utils/wrapAsync.js");

// connecting to mongo
const mongoose = require("mongoose");
main()
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/gymReview");
}

// setting up session
const sessionConfig = {
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 4,
    httpOnly: true,
  },
};
app.use(session(sessionConfig));

// setting up flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.fail = req.flash("fail");
  next();
});

// Using ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Using ejs-mate
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

// for images
app.use(express.static("assets"));

// Set up routes
const gymRoutes = require("./routes/gyms");
app.use("/gyms", gymRoutes);
const userRoutes = require("./routes/users");
app.use("/users", userRoutes);

app.listen(3000, () => {
  console.log("Listening on Port 3000!");
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});
