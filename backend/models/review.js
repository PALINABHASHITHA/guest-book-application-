const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  username: String,
  rating: Number,
  review: String
});

module.exports = mongoose.model("Review", ReviewSchema);