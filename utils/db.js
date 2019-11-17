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
        'INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING *',
        [sig, userId]
    );
};

exports.getExtraInfo = function getExtraInfo(age, city, web, userId) {
    return db.query(
        'INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [age, city, web, userId]
    );
};

exports.getProfile = function getProfile(userId) {
    return (
        db.query(
            'SELECT users.id, first, last, email, age, city, url FROM users INNER JOIN user_profiles ON (users.id = user_profiles.user_id) WHERE users.id = $1'
        ),
        [userId]
    );
};

exports.updateProfile = function updateProfile(first, last, email, userId) {
    return db.query(
        'UPDATE users SET first = $1, last = $2, email = $3 WHERE id = $4',
        [first, last, email, userId]
    );
};

exports.updateProfilePassword = function updateProfilePassword(
    first,
    last,
    email,
    pwd,
    userId
) {
    return db.query(
        'UPDATE users SET first = $1, last = $2, email = $3, password = $4 WHERE id = $5',
        [first, last, email, pwd, userId]
    );
};

exports.updateProfileOptional = function updateProfileOptional(
    age,
    city,
    web,
    userId
) {
    return db.query(
        'INSERT INTO user_profiles(age, city, url, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age = $1, city = $2, url = $3 WHERE user_id = $4',
        [age, city, web, userId]
    );
};

exports.getSigners = function getSigners() {
    return db.query(
        'SELECT users.id, first, last, user_profiles.age, user_profiles.city, user_profiles.url FROM users FULL OUTER JOIN user_profiles ON (users.id = user_profiles.user_id) INNER JOIN signatures ON (user_profiles.user_id = signatures.user_id)'
    );
};

exports.getSignersByCity = function getSignersByCity(city) {
    return db.query(
        'SELECT * FROM users FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id WHERE LOWER(city) = LOWER($1)',
        [city]
    );
};

exports.selectSignature = function selectSignature() {
    return db.query('SELECT COUNT(id) FROM signatures');
};

exports.getSignature = function getSignature(id) {
    return db.query('SELECT signature FROM signatures WHERE id = $1', [id]);
};

exports.deleteSignature = function deleteSignature(id) {
    return db.query('DELETE FROM signatures WHERE id = $1', [id]);
};

exports.getPwd = function getPwd(email) {
    return db.query('SELECT password, id FROM users WHERE email = $1', [email]);
};

exports.hasSigned = function hasSigned(userId) {
    return db.query('SELECT id FROM signatures WHERE user_id = $1', [userId]);
};
