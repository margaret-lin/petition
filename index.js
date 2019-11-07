const express = require("express");
const app = express();
const db = require(".utils/db");

app.post("/add-city", (req, res) => {
    db.addCity("Taipei", 800000).then(() => {
        console.log("sucessful");
    });
});

app.get("/cities", (req, res) => {
    db.getCities()
        .then(({ rows }) => {
            console.log("rows: ", rows);
        })
        .catch(err => {
            console.log("errr in results", err);
        });
});

app.get("/petition", (req, res) => {
    res.send("<h1> petition works!</h1>");
});

app.listen(8080, () => console.log("I am listening!!"));
