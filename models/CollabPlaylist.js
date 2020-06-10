const mongoose = require("mongoose");

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