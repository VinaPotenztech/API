//server.js
const express = require("express");
const connectDB = require("../API/src/config/db");
const bodyParser = require("body-parser");
const userRoute=require('../API/src/routes/userRoute');
require("../API/src/config/dotenv");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

connectDB();
//use the user routes
app.use("/api",userRoute);
//start server
app.listen(port, () => {
  console.log(`Server is runnign on http://localhost:${port}`);
});
