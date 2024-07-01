const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    _id: String,
    displayName: String,
    username: String,
    iconURL: String,
    accentColor: String,
    joinedAt: Number,
    flags: Array,
    connectedAccounts: Object
}, { versionKey: false });

module.exports = model("users", userSchema);