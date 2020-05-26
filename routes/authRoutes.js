//imports express
const express = require("express");
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const keys = require("../config/authKeys");

const User = require("../models/User");
const uri = process.env.FRONTEND_URI || 'http://localhost:3000'; //prod heroku redirect or local dev redirect

//new instance of router where all routes will be added to
const router = express.Router();

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function(length) {
  var text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = 'spotify_auth_state';


router.get('/login', async function(req, res) {
  try{
    const collection = await User.collection.drop();         //empty out user collection before saving a new user this                
  }catch(err){                                               //ensures only the current user is in the collection
    console.log(err.message);
  } 

  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  const scope = 'user-read-private user-read-email playlist-read-collaborative playlist-modify-public playlist-modify-private playlist-read-private user-library-modify user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: keys.client_id,
      scope: scope,
      redirect_uri: keys.redirect_uri,
      state: state,
      show_dialog: true
    }));
});

router.get('/auth/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: keys.redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(keys.client_id + ':' + keys.client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        const access_token = body.access_token,
            refresh_token = body.refresh_token;

        const options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, async function(error, response, body) {
          const existingUser = await User.findOne({userId: body.id});
          if(existingUser){
            console.log("That User is already in the database")
          } else {
            console.log("CREATING NEW USER")
            const newUser = await new User({userId: body.id});
            newUser.save() 
          }
          
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect(uri + "/playlists/#" +              
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/playlists/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

//Returns the current user that signs on, make sure when we sign off we delete the user from the collection
router.get("/api/current_user", async (req, res) => {
  try{
    console.log("getting user from db")
    const current_user = await User.find();
    res.json(current_user);
  }catch(err){
    console.log("SOMETHING WENT WRONG");
  }
});

//Call this route when you want to logout, it will empty our User collection
router.get("/api/logout", async (req, res) =>{
  console.log("******** logout api ********");
  try{
    const collection = await User.collection.drop();
    res.redirect(uri + "/");                           
  }catch(err){
    console.log(err.message);
  } 
});

router.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  const refresh_token = req.query.refresh_token;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(keys.client_id + ':' + keys.client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

//export router
module.exports = router;