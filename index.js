const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./utils/db");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(express.static("./public"));

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main"
    });
});

app.post("/petition", (req, res) => {
    // console.log("made it to peition route");
    console.log("rec body", req.body);

    db.userInfo("Sarajevo", 700000)
        .then(() => {
            res.redirect("/signed");
            console.log("inserting names!");
        })
        .catch(err => {
            console.log("post error:", err);
        });
});

app.get("/signed", (req, res) => {
    res.render("signed", {
        layout: "main"
    });
});

app.get("/participants", (req, res) => {
    res.render("participants", {
        layout: "main"
    });
});

app.listen(8080, () => console.log("I am listening!!"));

// app.post("/add-city", (req, res) => {
//     db.addCity("Taipei", 800000).then(() => {
//         console.log("sucessful");
//     });
// });

// app.get("/cities", (req, res) => {
//     db.getCities()
//         .then(({ rows }) => {
//             console.log("rows: ", rows);
//         })
//         .catch(err => {
//             console.log("errr in results", err);
//         });
// });
