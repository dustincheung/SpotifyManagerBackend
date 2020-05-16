//loads environmental variables from a .env file, allows keys to persist each time you restart terminal
require("dotenv").config();

//************************************************
//					    SETUP
//************************************************
//importing packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const keys = require("./config/authKeys");

//importing db models and schema setup
const User = require("./models/User");

//importing routes
const authRoutes = require("./routes/authRoutes");

//connecting to secret mongoURI 
mongoose.connect(keys.mongo_uri);

//create app by executing express
const app = express();

//spotify OAuth
app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

//************************************************
//					    ROUTES
//************************************************
app.get("/", (req, res) => {
	res.send("Landing Page")
});

//spotify OAuth
app.use(authRoutes);

//************************************************
//					    SERVER
//************************************************
//Dynamic Port Binding for Heroku: if no env specified, use local port 5000
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	console.log("***SpotifyManager express server is running***")
});