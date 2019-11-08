var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

exports.userInfo = function userInfo(first, last) {
    return db.query("INSERT INTO signatures (first, last) VALUES ($1, $2)", [
        first,
        last
    ]);
};

exports.selectUser = function selectUser(first, last) {
    return db.query("SELECT signatures FROM signatures VALUES ($1, $2)", [
        first,
        last
    ]);
};

exports.selectSig = function selectSig() {
    return db.query("SELECT COUNT(*) FROM signatures");
};
