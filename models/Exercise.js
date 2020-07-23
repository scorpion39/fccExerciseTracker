const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  username: {
    type: String,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  ref: {},
});

module.exports = mongoose.model("Exercise", ExerciseSchema);
