var spicedPg = require('spiced-pg');
var db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

exports.userInfo = function userInfo(sig) {
    return db.query(
        'INSERT INTO signatures (signature) VALUES ($1) RETURNING id',
        [sig]
    );
};

exports.getUserInput = function getUserInput(first, last, email, pwd) {
    return db.query(
        'INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id',
        [first, last, email, pwd]
    );
};

exports.getSigners = function getSigners() {
    return db.query('SELECT first, last FROM signatures');
};

exports.selectSig = function selectSig() {
    return db.query('SELECT COUNT(*) FROM signatures');
};

exports.getSig = function getSig(id) {
    return db.query('SELECT signature FROM signatures WHERE id = $1', [id]);
};

exports.getPwd = function getPwd(email) {
    return db.query('SELECT password, id FROM signatures WHERE email = $1', [
        email
    ]);
};
