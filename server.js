const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const notFound = require("./middleware/not_found");
const errorHandler = require("./middleware/error_handler");

const app = express();
dotenv.config({ path: "./config/config.env" });

//App middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

connectDB();

//Static folder
app.use(express.static("public"));

//Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use("/api/exercise", require("./routes/app"));

//self-middleware
app.use(notFound);
app.use(errorHandler);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
