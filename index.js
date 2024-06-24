const express = require("express");
const app = express();
const port = 3000;

const user = null;

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home", { user });
});

app.get("/gallery", (req, res) => {
    res.render("gallery", { user });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
