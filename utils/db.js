var spicedPg = require('spiced-pg');
var db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

exports.userInfo = function userInfo(first, last, sig) {
    return db.query(
        'INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id',
        [first, last, sig]
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
