const express = require("express");
const router = express.Router();
const Users = require("../models/users.js");

const config = require("../config.json");

router.use("/authorize", require("./authorize.js"));

router.get("/", (req, res) => {
    res.render("home", { user: req.session.user });
});

router.get("/gallery", (req, res) => {
    res.render("gallery", { user: req.session.user });
});

router.get("*", (req, res) => {
    res.send("How did we get here?");
});

module.exports = router;