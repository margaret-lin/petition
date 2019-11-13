var spicedPg = require('spiced-pg');
var db = spicedPg(
    process.env.DATABASE_URL ||
        'postgres:postgres:postgres@localhost:5432/petition'
);

exports.getUserInput = function getUserInput(first, last, email, pwd) {
    return db.query(
        'INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id',
        [first, last, email, pwd]
    );
};
exports.userInfo = function userInfo(sig, userId) {
    return db.query(
        'INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id',
        [sig, userId]
    );
};

exports.getExtraInfo = function getExtraInfo(age, city, web, userId) {
    return db.query(
        'INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id',
        [age, city, web, userId]
    );
};

exports.getUrl = function getUrl(userId) {
    return db.query('SELECT url FROM user_profiles WHERE user_id = $1', [
        userId
    ]);
};

exports.getSigners = function getSigners() {
    return db.query(
        'SELECT users.id, first, last FROM users INNER JOIN signatures ON (users.id = signatures.user_id)'
    );
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
    return db.query('SELECT id FROM signatures WHERE user_id = $1', [userId]);
};
