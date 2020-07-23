const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

const User = require("../models/User");
const Exercise = require("../models/Exercise");

// @desc Create new user
//@ route POST /new-user
router.post("/new-user", async (req, res) => {
  try {
    const username = req.body.username;
    const id = uuidv4();
    const foundUser = await User.findOne({ username });
    if (foundUser) {
      return res.json("username is already taken");
    }

    const newuser = { username, id };
    await User.create(newuser);
    res.json({
      username,
      _id: id,
    });
  } catch (err) {
    console.error(err);
    res.json({ error: "Server error" });
  }
});

// @desc Get all users
//@ route GET /users
router.get("/users", async (req, res) => {
  try {
    const allUsers = await User.find().lean();
    res.json(allUsers);
  } catch (err) {
    res.json({ error: "Server error" });
  }
});

// @desc Add new Exercise for a gaiven user
//@ route GET /add
router.post("/add", async (req, res) => {
  const exercise = req.body;
  try {
    // console.log("Were you even here bro");
    // const bigOne = `Id is ${exercise.userId}\nDescription is ${exercise.description}\nDate is${exercise.date}\nDuration is ${exercise.duration}`;
    // console.log(bigOne);
    const foundExercise = await User.findById(exercise.userId).lean();

    if (!foundExercise) {
      // console.log("Falied first");
      return res.json({ error: "User not found" });
    }
    // console.log("Atleast went through that");
    const theDate = exercise.date ? new Date(exercise.date) : new Date();

    if (!exercise.description) {
      return res.json("Description is required");
    } else if (!exercise.duration) {
      return res.json("Duration is required");
    } else if (parseFloat(exercise.duration) != exercise.duration) {
      return res.json("Duration must be a number");
    } else if (!theDate.getTime() || parseInt(exercise.date) == exercise.date) {
      return res.json("Enter a valid date");
    }

    exercise.date = theDate;
    exercise.username = foundExercise.username;
    await Exercise.create(exercise);
    res.json({
      _id: exercise.userId,
      username: exercise.username,
      date: moment(theDate).format("MMMM Do YYYY, h:mm:ss a"),
      duration: exercise.duration,
      description: exercise.description,
    });
  } catch (err) {
    res.json({ error: "Server error" });
  }
});

// @desc Get all users and some parameters in the query
//@ route GET /log?
router.get("/api/exercise/log?", async (req, res) => {
  const items = req.query;
  let keys = Object.keys(items);
  if (keys.length === 0) return res.json("No parameters listed");

  if (keys.includes("userId")) {
    try {
      let exercises;
      const user = await User.findById(items.userId);

      if (
        keys.includes("limit") &&
        keys.includes("from") &&
        keys.includes("to")
      ) {
        let { limit, to: toDate, from: fromDate } = items;
        toDate = new Date(toDate);
        fromDate = new Date(fromDate);

        if (limit != parseInt(limit)) {
          return res.json("Enter a valid limit");
        } else if (!toDate.getTime()) {
          return res.json("Enter a valid to date");
        } else if (!fromDate.getTime()) {
          return res.json("Enter a valid from date");
        } else {
          exercises = await Exercise.find({
            userId: items.userId,
            date: {
              $gte: fromDate,
              $lte: toDate,
            },
          }).limit(parseInt(limit));
        }
      } else if (keys.includes("limit") && keys.includes("from")) {
        let { limit, from: fromDate } = items;
        fromDate = new Date(fromDate);
        if (limit != parseInt(limit)) {
          return res.json("Enter a valid limit");
        } else if (!fromDate.getTime()) {
          return res.json("Enter a valid from date");
        } else {
          exercises = await Exercise.find({
            userId: items.userId,
            date: {
              $gte: fromDate,
            },
          }).limit(parseInt(limit));
        }
      } else if (keys.includes("limit") && keys.includes("to")) {
        let { limit, to: toDate } = items;
        toDate = new Date(toDate);
        if (limit != parseInt(limit)) {
          return res.json("Enter a valid limit");
        } else if (!toDate.getTime()) {
          return res.json("Enter a valid from date");
        } else {
          exercises = await Exercise.find({
            userId: items.userId,
            date: {
              $lte: toDate,
            },
          }).limit(parseInt(limit));
        }
      } else if (keys.includes("from") && keys.includes("to")) {
        let { from: fromDate, to: toDate } = items;
        toDate = new Date(toDate);
        fromDate = new Date(fromDate);
        if (!toDate.getTime()) {
          return res.json("Enter a valid to date");
        } else if (!fromDate.getTime()) {
          return res.json("Enter a valid from date");
        } else {
          exercises = await Exercise.find({
            userId: items.userId,
            date: {
              $lte: toDate,
              $gte: fromDate,
            },
          });
        }
      } else if (keys.includes("limit")) {
        let { limit } = items;

        if (limit != parseInt(limit)) {
          return res.json("Enter a valid limit");
        } else {
          exercises = await Exercise.find({ userId: items.userId }).limit(
            parseInt(limit)
          );
        }
      } else if (keys.includes("from")) {
        let { from: fromDate } = items;
        fromDate = new Date(fromDate);
        if (!fromDate.getTime()) {
          return res.json("Enter a valid from date");
        } else {
          exercises = await Exercise.find({
            userId: items.userId,
            date: {
              $gte: fromDate,
            },
          });
        }
      } else if (keys.includes("to")) {
        let { to: toDate } = items;
        toDate = new Date(toDate);
        if (!toDate.getTime()) {
          return res.json("Enter a valid to date");
        } else {
          exercises = await Exercise.find({
            userId: items.userId,
            date: {
              $lte: toDate,
            },
          });
        }
      } else {
        exercises = await Exercise.find({ userId: items.userId });
      }

      res.json({
        _id: items.userId,
        username: user.username,
        count: exercises.length,
        log: exercises,
      });
    } catch (err) {
      res.json("Unknown user");
    }
  } else {
    return res.json("UserId required");
  }
});

module.exports = router;
