const mongoose = require("mongoose");
const { ExerciseSchema } = require("../models/Exercise");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },

  log: [ExerciseSchema],
});

module.exports = mongoose.model("User", UserSchema);
