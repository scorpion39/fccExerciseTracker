const express = require("express");
const router = express.Router();
const moment = require("moment");
const shortid = require("shortid");
const { ObjectID } = require("mongodb");

// const { v4: uuidv4 } = require("uuid"); //id was too long

const User = require("../models/User");
const Exercise = require("../models/Exercise");

// @desc Create new user
//@ route POST /new-user
router.post("/new-user", async (req, res) => {
  // const id = uuidv4();
  // const _id = shortid.generate();
  const newObjectId = new ObjectID();
  try {
    const username = req.body.username;
    const foundUser = await User.findOne({ username });
    if (foundUser) {
      return res.json("username is already taken");
    }

    const newuser = { username, _id: newObjectId };
    await User.create(newuser);

    res.json({
      username,
      _id: newObjectId,
    });
  } catch (err) {
    console.error(err);
    res.json({ error: "Server error", newObjectId });
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
  const { userId, description, duration, date } = req.body;
  const dateObj = date === "" ? new Date() : new Date(date);

  if (!description) {
    return res.json("Description is required");
  } else if (!duration) {
    return res.json("Duration is required");
  } else if (parseFloat(duration) != duration) {
    return res.json("Duration must be a number");
  } else if (!dateObj.getTime() || parseInt(date) == date) {
    return res.json("Enter a valid date");
  }

  let foundUser;
  try {
    foundUser = await User.findById(userId).lean();
  } catch (err) {
    return res.json("User unknown");
  }

  const newExercise = {
    userId,
    description,
    duration: +duration,
    date: dateObj,
    username: foundUser.username,
  };

  const displayExercise = {
    _id: userId,
    description,
    duration: +duration,
    date: dateObj.toString().slice(0, 15),
    username: foundUser.username,
  };
  try {
    Exercise.create(newExercise);
  } catch (err) {
    console.error(err);
    return res.json("Unable to create new exercise");
  }
  res.json(displayExercise);
});

// @desc Get exerices that match the givem queries
//@ route GET /log?

router.get("/log?", async (req, res) => {
  const { userId, from, to, limit } = req.query;
  let user;
  try {
    user = await User.findById(userId).lean();
  } catch (err) {
    console.error(err);
    return res.json("User not found");
  }
  let log;
  try {
    log = await Exercise.find({ userId })
      .select("description duration date")
      .lean();
  } catch (err) {
    console.error(err);
    res.json("Server error");
  }

  if (from) {
    const fromDate = new Date(from);
    log = log.filter((eachExercise) => new Date(eachExercise.date >= fromDate));
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter((eachExercise) => new Date(eachExercise.date) <= toDate);
  }

  if (limit) {
    log = log.slice(0, +limit);
  }

  log = log.map((eachExercise) => {
    eachExercise.date = eachExercise.date.toString().slice(0, 15);
    return eachExercise;
  });

  const displayed = {
    _id: userId,
    username: user.username,
    count: log.length,
    log,
  };

  console.log(displayed);
  res.json(displayed);

  // const items = req.query;
  // let keys = Object.keys(items);
  // if (keys.length === 0) return res.json("No parameters listed");

  // if (keys.includes("userId")) {
  //   try {
  //     let exercises;
  //     const user = await User.findById(items.userId);

  //     if (
  //       keys.includes("limit") &&
  //       keys.includes("from") &&
  //       keys.includes("to")
  //     ) {
  //       let { limit, to: toDate, from: fromDate } = items;
  //       toDate = new Date(toDate);
  //       fromDate = new Date(fromDate);

  //       if (limit != parseInt(limit)) {
  //         return res.json("Enter a valid limit");
  //       } else if (!toDate.getTime()) {
  //         return res.json("Enter a valid to date");
  //       } else if (!fromDate.getTime()) {
  //         return res.json("Enter a valid from date");
  //       } else {
  //         exercises = await Exercise.find({
  //           userId: items.userId,
  //           date: {
  //             $gte: fromDate,
  //             $lte: toDate,
  //           },
  //         }).limit(parseInt(limit));
  //       }
  //     } else if (keys.includes("limit") && keys.includes("from")) {
  //       let { limit, from: fromDate } = items;
  //       fromDate = new Date(fromDate);
  //       if (limit != parseInt(limit)) {
  //         return res.json("Enter a valid limit");
  //       } else if (!fromDate.getTime()) {
  //         return res.json("Enter a valid from date");
  //       } else {
  //         exercises = await Exercise.find({
  //           userId: items.userId,
  //           date: {
  //             $gte: fromDate,
  //           },
  //         }).limit(parseInt(limit));
  //       }
  //     } else if (keys.includes("limit") && keys.includes("to")) {
  //       let { limit, to: toDate } = items;
  //       toDate = new Date(toDate);
  //       if (limit != parseInt(limit)) {
  //         return res.json("Enter a valid limit");
  //       } else if (!toDate.getTime()) {
  //         return res.json("Enter a valid from date");
  //       } else {
  //         exercises = await Exercise.find({
  //           userId: items.userId,
  //           date: {
  //             $lte: toDate,
  //           },
  //         }).limit(parseInt(limit));
  //       }
  //     } else if (keys.includes("from") && keys.includes("to")) {
  //       let { from: fromDate, to: toDate } = items;
  //       toDate = new Date(toDate);
  //       fromDate = new Date(fromDate);
  //       if (!toDate.getTime()) {
  //         return res.json("Enter a valid to date");
  //       } else if (!fromDate.getTime()) {
  //         return res.json("Enter a valid from date");
  //       } else {
  //         exercises = await Exercise.find({
  //           userId: items.userId,
  //           date: {
  //             $lte: toDate,
  //             $gte: fromDate,
  //           },
  //         });
  //       }
  //     } else if (keys.includes("limit")) {
  //       let { limit } = items;

  //       if (limit != parseInt(limit)) {
  //         return res.json("Enter a valid limit");
  //       } else {
  //         exercises = await Exercise.find({ userId: items.userId }).limit(
  //           parseInt(limit)
  //         );
  //       }
  //     } else if (keys.includes("from")) {
  //       let { from: fromDate } = items;
  //       fromDate = new Date(fromDate);
  //       if (!fromDate.getTime()) {
  //         return res.json("Enter a valid from date");
  //       } else {
  //         exercises = await Exercise.find({
  //           userId: items.userId,
  //           date: {
  //             $gte: fromDate,
  //           },
  //         });
  //       }
  //     } else if (keys.includes("to")) {
  //       let { to: toDate } = items;
  //       toDate = new Date(toDate);
  //       if (!toDate.getTime()) {
  //         return res.json("Enter a valid to date");
  //       } else {
  //         exercises = await Exercise.find({
  //           userId: items.userId,
  //           date: {
  //             $lte: toDate,
  //           },
  //         });
  //       }
  //     } else {
  //       exercises = await Exercise.find({ userId: items.userId });
  //     }

  //     res.json({
  //       _id: items.userId,
  //       username: user.username,
  //       count: exercises.length,
  //       log: exercises,
  //     });
  //   } catch (err) {
  //     res.json("Unknown user");
  //   }
  // } else {
  //   return res.json("UserId required");
  // }
});

module.exports = router;
