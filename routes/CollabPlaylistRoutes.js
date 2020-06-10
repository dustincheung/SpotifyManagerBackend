//imports
const express = require("express");
const bodyParser = require("body-parser");

//importing db models and schema setup
const CollabPlaylist = require("../models/CollabPlaylist");

const router = express.Router();

//************************************************
//				  COLLABPLAYLISTS ROUTES
//************************************************

//INDEX ROUTE:
router.get("/collabplaylists", async(req, res) => {
	const collabPlaylists = await CollabPlaylist.find();
	res.send(collabPlaylists);
});

//SHOW ROUTE:


//CREATE ROUTE: creates collabPlaylist from values in req.body obj and adds to mongo db
//responds with collabPlaylist obj back to allow dispatch to update redux store
router.post("/collabplaylists", async(req, res) => {
	const collabPlaylist = {
		name: req.body.name,
		description: req.body.description,
		tracks: [],
		collaborators: req.body.collaborators
	}

	await CollabPlaylist.create(collabPlaylist, (err, collabPlaylist) => {
		if(err){
			console.log(err);
		}else{
			res.send(collabPlaylist);
		}
	})

});

//EDIT ROUTE:

//UPDATE ROUTE:

//DELETE ROUTE: takes id from url param and removes document with that id
router.delete("/collabplaylists/:id/delete", async(req, res) => {
	const id = req.params.id;
	const result = await CollabPlaylist.findByIdAndRemove(id);
	res.send(result);
})

//************************************************
//		 COLLABPLAYLISTS TRACKS ROUTES
//************************************************

//INDEX ROUTE:
router.get("/collabplaylists/:id/tracks", async (req, res) => {
	const id = req.params.id;

	await CollabPlaylist.findById(id, (err, playlist) => {
		if(err){
			console.log(err);
		}else{
			res.send(playlist.tracks);
		}

	})
})

//CREATE ROUTE: adds tracks to existent tracks array of collabPlaylist document, also appends the new collaborator 
router.post("/collabplaylists/:id/tracks", async (req, res) => {
	const id = req.params.id;
	const collaborator = req.body.collaborator;
	const collabTracks = req.body.collabTracks;

	//appends new tracks and collaborators
	await CollabPlaylist.findByIdAndUpdate(id, {$addToSet: {"collaborators": collaborator, "tracks": collabTracks}}, (err, playlist) => {
		if(err){
			console.log(err);
		}else{
			res.send(playlist);
		}
	})
})
module.exports = router;