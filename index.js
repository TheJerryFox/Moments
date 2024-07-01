const express = require("express");
const session = require("express-session");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const config = require("./config.json");
const router = require("./routes/main");
const { Client, IntentsBitField } = require("discord.js");
require('dotenv').config();

const client = new Client({
    intents: [ IntentsBitField.Flags.DirectMessages ]
});

client.login(process.env.discord_webapp_token);

client.on("ready", () => {
    console.log("Discord connection is established!");
});

async function connectDatabase() {
    await mongoose.connect(`${config.database.url}/${config.database.name}`);
};

connectDatabase()
    .then(() => console.log("Connected to the database!"))
    .catch(e => console.error("Couldn't connect to the database!", e));

process.on("uncaughtException", (e) => {
    console.error(e);
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "65650d266c33db81924801ef8eb227d71a621fd0f1db65d3ecade95d4efac9b4",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // MUSS AUF TRUE WENN HTTPS!!!!!!!!!!!!!!!!!!!!
}));

app.listen(port, () => {
    console.log(`Application listening at http://localhost:${port}`);
});

module.exports = { client };

app.use("/", router);
