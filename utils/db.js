var spicedPg = require('spiced-pg');
var db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

exports.userInfo = function userInfo(sig, user_id) {
    return db.query(
        'INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id',
        [sig, user_id]
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
    return db.query('SELECT password, id FROM users WHERE email = $1', [email]);
};

exports.hasSigned = function hasSigned(userId) {
    return db.query('SELECT user_id FROM signatures WHERE user_id = $1', [
        userId
    ]);
};
