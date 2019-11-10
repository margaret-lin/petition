var spicedPg = require('spiced-pg');
var db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

exports.userInfo = function userInfo(first, last, sig) {
    return db.query(
        'INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id',
        [first, last, 'me']
    );
};

exports.selectUser = function selectUser(first, last) {
    return db.query('SELECT signatures FROM signatures VALUES ($1, $2)', [
        first,
        last
    ]);
};

exports.selectSig = function selectSig() {
    return db.query('SELECT COUNT(*) FROM signatures');
};

exports.getSig = function getSig(id) {
    return db.query('SELECT signatures FROM signatures WHERE id = $1', [id]);
};
