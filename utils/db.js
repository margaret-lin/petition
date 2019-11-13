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
        'INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [age, city, web, userId]
    );
};

exports.getSigners = function getSigners() {
    return db.query(
        'SELECT users.id, first, last, user_profiles.age, user_profiles.city, user_profiles.url FROM users INNER JOIN user_profiles ON (users.id = user_profiles.user_id) INNER JOIN signatures ON (user_profiles.user_id = signatures.user_id)'
    );
};

// exports.getSigners = function getSigners() {
//     return db.query(
//         'SELECT users.id, users.first, users.last, user_profiles_age, user_profiles_city, user_profiles_url FROM users INNER JOIN user_profiles ON (users.id = user_profiles_user_id INNER JOIN signatures ON (user_profiles_user_id = signatures.user_id)'
//     );
// };

exports.getSignersByCity = function getSignersByCity(city) {
    return db.query(
        'SELECT * FROM user_profiles WHERE LOWER(city) = LOWER($1)',
        [city]
    );
};

exports.selectSignature = function selectSignature() {
    return db.query('SELECT COUNT(*) FROM signatures');
};

exports.getSignature = function getSignature(id) {
    return db.query('SELECT signature FROM signatures WHERE id = $1', [id]);
};

exports.getPwd = function getPwd(email) {
    return db.query('SELECT password, id FROM users WHERE email = $1', [email]);
};

exports.hasSigned = function hasSigned(userId) {
    return db.query('SELECT id FROM signatures WHERE user_id = $1', [userId]);
};
