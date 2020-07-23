const express = require("express");
const router = express.Router();

const User = require("../models/User");
const { Exercise } = require("../models/Exercise");

//@POST   new-user
//DESC  create a new-user
router.post("/new-user", (req, res) => {
  let newUser = new User({ username: req.body.username });
  newUser.save((error, savedUser) => {
    if (!error) {
      let responseObject = {};
      responseObject["username"] = savedUser.username;
      responseObject["_id"] = savedUser.id;
      res.json(responseObject);
    }
  });
});

//@GET /users
//DESC //get all users data
router.get("/users", (req, res) => {
  User.find({}, (error, arrayOfUsers) => {
    if (!error) {
      res.json(arrayOfUsers);
    }
  });
});

//@POST /add
//DESC create exercise for a user
router.post("/add", (req, res) => {
  let newExercise = new Exercise({
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date,
  });

  if (newExercise.date === "") {
    newExercise.date = new Date().toISOString().substring(0, 10);
  }

  User.findByIdAndUpdate(
    req.body.userId,
    { $push: { log: newExercise } },
    { new: true },
    (error, updatedUser) => {
      if (!error) {
        let responseObject = {};
        responseObject["_id"] = updatedUser.id;
        responseObject["username"] = updatedUser.username;
        responseObject["date"] = new Date(newExercise.date).toDateString();
        responseObject["description"] = newExercise.description;
        responseObject["duration"] = newExercise.duration;
        res.json(responseObject);
      }
    }
  );
});

//@GET  /log
//DESC  //get exercise for a given user based on given query fields
router.get("/log", (req, res) => {
  User.findById(req.query.userId, (error, result) => {
    if (!error) {
      let responseObject = result;

      if (req.query.from || req.query.to) {
        let fromDate = new Date();
        let toDate = new Date();

        if (req.query.from) {
          fromDate = new Date(req.query.from);
        }

        if (req.query.to) {
          toDate = new Date(req.query.to);
        }

        fromDate = fromDate.getTime();
        toDate = toDate.getTime();

        responseObject.log = responseObject.log.filter((exercise) => {
          let exerciseDate = new Date(exercise.date).getTime();

          return exerciseDate >= fromDate && exerciseDate <= toDate;
        });
      }

      if (req.query.limit) {
        responseObject.log = responseObject.log.slice(0, req.query.limit);
      }

      responseObject["count"] = result.log.length;
      res.json(responseObject);
    }
  });
});

module.exports = router;
