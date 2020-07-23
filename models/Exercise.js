const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema({
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
    type: String,
    trim: true,
  },
});

module.exports.Exercise = mongoose.model("Exercise", ExerciseSchema);
module.exports.ExerciseSchema = ExerciseSchema;
