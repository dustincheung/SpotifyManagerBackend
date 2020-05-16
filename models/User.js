const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	userId: String,
	accessToken: String,
	refreshToken: String
});

const User = mongoose.model("User", UserSchema);

module.exports = User;