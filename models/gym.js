const mongoose = require("mongoose");

const gymSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  location: {
    type: String,
  },
  services: {
    type: String,
  },
  equipment: {
    type: String,
  },
  image: {
    type: String,
  },
  description: {
    type: String,
  },
  contact: {
    type: String,
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

gymSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const reviews = [...doc.reviews];

    for (let review of reviews) {
      await Review.deleteMany({ _id: review });
    }
  }
});

const Gym = mongoose.model("Gym", gymSchema);
module.exports = Gym;
