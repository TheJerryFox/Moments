const express = require("express");
const router = express.Router();
const Users = require("../models/users.js");
const config = require("../config.json");
const moment = require("moment");
require("moment-duration-format");
require('dotenv').config();
const scopes = ["identify"];

const forceAuth = (req, res, next) => {
    if (!req.session.user) return res.redirect("/authorize");
    else return next();
}

router.get("/discord", (req, res) => {
    if (req.session.user) return res.redirect("/");
    const authorizeUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.discord.webapp.id}&redirect_uri=${encodeURIComponent(config.discord.webapp.redirect_uri)}&response_type=code&scope=${scopes.join('%20')}`;
    return res.redirect(authorizeUrl);
});

router.get('/discord/callback', async (req, res) => {
    if (req.session.user) return res.redirect("/");
    const accessCode = req.query.code;
    if (!accessCode) {
        return res.redirect("/");
    }

    const data = new URLSearchParams();
    data.append("client_id", config.discord.webapp.id);
    data.append("client_secret", process.env.discord_webapp_clientSecret);
    data.append("grant_type", "authorization_code");
    data.append("redirect_uri", config.discord.webapp.redirect_uri);
    data.append("scope", scopes.join(" "));
    data.append("code", accessCode);

    try {
        const tokenResponse = await fetch("https://discordapp.com/api/oauth2/token", {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: data.toString()
        }).then(res => res.json());

        const userResponse = await fetch("https://discordapp.com/api/users/@me", {
            method: "GET",
            headers: {
                authorization: `${tokenResponse.token_type} ${tokenResponse.access_token}`
            },
        }).then(res => res.json());

        const { client } = require("../index.js");
        const user = await client.users.fetch(userResponse.id).catch((e) => console.error(e));

        var dbUser = await Users.findOne({ 'connectedAccounts.discord.id': user.id }).lean();
        console.log(dbUser)
        if (!dbUser) {
            const now = new moment().utc();
            const id = Date.now().toString(16) + Math.floor(Math.pow(10, 12) + Math.random() * 9*Math.pow(10, 12)).toString(16);
            const userObject = {
                _id: id,
                displayName: user.displayName,
                username: user.username,
                iconURL: userResponse.avatar ? (userResponse.avatar.startsWith("a_") ? `https://cdn.discordapp.com/avatars/${userResponse.id}/${userResponse.avatar}.gif?size=4096` : `https://cdn.discordapp.com/avatars/${userResponse.id}/${userResponse.avatar}.png?size=4096`) : null, 
                accentColor: user.accentColor || null,
                joinedAt: now,
                flags: [],
                connectedAccounts: {
                    discord: {
                        id: user.id,
                        connectedAt: now
                    }
                }
            };
            dbUser = userObject;
            await Users.create(userObject);
        }

        req.session.user = dbUser;
        return res.redirect("/");

    } catch (error) {
        console.error(error);
        return res.redirect("/");
    }
});

module.exports = router;

router.get("/logout", forceAuth, (req, res) => {
    req.session.destroy((error)=>{
      if(error) return console.error(`A session could not be destroyed!`, error);
    });
    return res.redirect("/");
});

module.exports = router;