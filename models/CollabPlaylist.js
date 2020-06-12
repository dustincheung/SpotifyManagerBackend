const mongoose = require("mongoose");

//schema aligns with official spotify playlist/tracks structure,  
// but only has the essential fields being utilized
const CollabPlaylistSchema = new mongoose.Schema({
	name: String,
	description: String,
	tracks:[
		{
			track: {
				type: {
					name: String,
					uri: String,
					artists: [
						{
							type: {
								name: String
							}
						}
					]

				}
			}
		}
	],
	collaborators:[
		{
			type: String
		}
	]
});

const CollabPlaylist = mongoose.model("CollabPlaylist", CollabPlaylistSchema);

module.exports = CollabPlaylist;