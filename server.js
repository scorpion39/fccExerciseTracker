const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const notFound = require("./middleware/not_found");
const errorHandler = require("./middleware/error_handler");

const connectDB = require("./config/db");

const app = express();

dotenv.config({ path: "./config/config.env" });

// mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )
app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

connectDB();

app.use(express.static("public"));

//Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use("/api/exercise", require("./routes/app"));

//middleware
app.use(notFound);
app.use(errorHandler);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
