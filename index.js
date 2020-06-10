//loads environmental variables from a .env file, allows keys to persist each time you restart terminal
require("dotenv").config();

//************************************************
//					    SETUP
//************************************************
//importing packages
const express = require("express");
const bodyParser = require("body-parser");	
const mongoose = require("mongoose");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const keys = require("./config/authKeys");

//create app by executing express
const app = express();

//allows routes to access req.body
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: true}));

//spotify OAuth
app.use(express.static(__dirname + '/public'))
	.use(cors())
    .use(cookieParser());

//importing db models and schema setup
const User = require("./models/User");
const CollabPlaylist = require("./models/CollabPlaylist");

//importing routes
const authRoutes = require("./routes/authRoutes");
const collabPlaylistRoutes = require("./routes/CollabPlaylistRoutes");

//connecting to secret mongoURI 
mongoose.connect(keys.mongo_uri);

//************************************************
//					    ROUTES
//************************************************

//tell app to use routes
app.use(authRoutes);
app.use(collabPlaylistRoutes);

//************************************************
//					    SERVER
//************************************************
//Dynamic Port Binding for Heroku: if no env specified, use local port 5000
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	console.log("***SpotifyManager express server is running***")
});