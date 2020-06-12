//imports
const express = require("express");
const bodyParser = require("body-parser");

//importing db models and schema setup
const CollabPlaylist = require("../models/CollabPlaylist");

const router = express.Router();

//************************************************
//				  COLLABPLAYLISTS ROUTES
//************************************************

//NOTE: b/c we are using SPA the new, edit, show pages do not need to be requeted but rather 
//the paths are hooked up using react router in the frontend

//INDEX ROUTE:
router.get("/collabplaylists", async(req, res) => {
	const collabPlaylists = await CollabPlaylist.find();
	res.send(collabPlaylists);
});

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

//UPDATE ROUTE:
router.patch("/collabplaylists/:id", async(req, res) => {
	const id = req.params.id;
	const name = req.body.name;
	const description = req.body.description;

	await CollabPlaylist.findByIdAndUpdate(id, {name: name, description: description}, (err, playlist) => {
		if(err){
			console.log(err);
		}else{
			res.send(playlist);
		}
	})
})

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