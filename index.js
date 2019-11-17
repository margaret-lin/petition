/* 
Things to do for the next project:
- use middleware for all authentification
- supertest
- redis
- tryout css grid instead of flexbox
*/

const express = require('express');
const app = express();
const hb = require('express-handlebars');
const db = require('./utils/db');
const csurf = require('csurf');
const cookieSession = require('cookie-session');
const { hash, compare } = require('./utils/bc');

app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(
    cookieSession({ secret: `my secret`, maxAge: 1000 * 60 * 60 * 24 * 14 })
);
app.use(csurf());
app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use(express.static('./public'));

// routes
app.get('/', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/register');
    }
    if (req.session.sigId) {
        res.redirect('/signed');
    } else {
        res.redirect('/petition');
    }
});

app.get('/register', (req, res) => {
    if (req.session.userId) {
        res.redirect('/petition');
    } else {
        res.render('register', {
            layout: 'main'
        });
    }
});

app.post('/register', (req, res) => {
    hash(req.body.pwd)
        .then(hashPwd => {
            db.getUserInput(
                req.body.first,
                req.body.last,
                req.body.email,
                hashPwd
            )
                .then(({ rows }) => {
                    console.log('reqbody', req.body);
                    req.session.userId = rows[0].id;
                    res.redirect('/profile');
                    console.log('userid', req.session.userId);
                })
                .catch(err => {
                    console.log('post error:', err);
                    res.render('register', {
                        layout: 'main',
                        error: true
                    });
                });
        })
        .catch(err => {
            console.log(err);
        });
});

app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'main'
    });
});

app.post('/login', (req, res) => {
    let email = req.body.email;
    let inputPwd = req.body.pwd;

    // fetch pwd from db
    db.getPwd(email).then(({ rows }) => {
        let hashedPwd = rows[0].password;

        // compare pwd from input and db
        compare(inputPwd, hashedPwd).then(match => {
            if (match) {
                // user entered correct pwd
                // store the user's id in session
                let userId = rows[0].id;
                req.session.userId = userId;

                // check if the user has signed
                db.hasSigned(userId)
                    .then(({ rows }) => {
                        // if not signed (length = 0) = no result
                        if (rows.length === 0) {
                            res.redirect('/petition');
                        } else {
                            // if user signed already, save signature's id in session
                            let signatureId = rows[0].id;
                            req.session.sigId = signatureId;
                            res.redirect('/signed');
                        }
                    })
                    .catch(err => {
                        console.log('hashpost', err);
                    });
            } else {
                res.render('login', {
                    layout: 'main',
                    error: true
                });
            }
        });
    });
});

app.get('/petition', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/');
    }
    if (req.session.sigId) {
        res.redirect('/signed');
    } else {
        res.render('petition', {
            layout: 'main',
            isLoggedIn: true
        });
    }
});

app.post('/petition', (req, res) => {
    // console.log('rec body', req.body);

    db.userInfo(req.body.sig, req.session.userId)
        .then(({ rows }) => {
            req.session.sigId = rows[0].id;
            console.log('my cookie session', req.session.sigId);
            res.redirect('/signed');
        })
        .catch(err => {
            console.log('post error:', err);
        });
});

app.get('/signed', (req, res) => {
    if (!req.session.sigId) {
        res.redirect('/');
        return;
    }
    db.getSignature(req.session.sigId).then(({ rows }) => {
        let imageSig = rows[0].signature;

        db.selectSignature()
            .then(({ rows }) => {
                res.render('signed', {
                    layout: 'main',
                    isLoggedIn: true,
                    num: rows[0].count,
                    image: imageSig
                });
            })
            .catch(err => {
                console.log('post error:', err);
            });
    });
});

app.post('/signed', (req, res) => {
    db.deleteSignature(req.session.sigId).then(() => {
        req.session.sigId = null;
        res.redirect('/petition');
    });
});

app.get('/signers', (req, res) => {
    if (!req.session.sigId) {
        res.redirect('/');
        return;
    }

    db.getSigners().then(({ rows }) => {
        res.render('signers', {
            layout: 'main',
            isLoggedIn: true,
            signers: rows
        });
    });
});

app.get('/signers/:city', (req, res) => {
    let { city } = req.params;

    if (!req.session.sigId) {
        res.redirect('/petition');
        return;
    }

    db.getSignersByCity(city).then(({ rows }) => {
        res.render('signers', {
            layout: 'main',
            isLoggedIn: true,
            signers: rows
        });
    });
});

app.get('/profile', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/');
    }
    res.render('profile', {
        layout: 'main'
    });
});

app.post('/profile', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/');
    }
    db.getExtraInfo(
        req.body.age || null,
        req.body.city,
        req.body.web,
        req.session.userId
    )
        .then(({ rows }) => {
            let webUrl = rows[0].url;

            if (
                webUrl.startsWith('http://') ||
                webUrl.startsWith('https://') ||
                webUrl.length === 0
            ) {
                console.log('it works!');

                res.redirect('/petition');
            } else {
                console.log('input not https/http');
                res.render('profile', {
                    layout: 'main',
                    error: true
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.render('profile', {
                layout: 'main',
                error: true
            });
        });
});

app.get('/profile/edit', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/');
    }
    db.getProfile().then(({ rows }) => {
        res.render('edit', {
            layout: 'main',
            input: rows[rows.length - 1],
            isLoggedIn: true
        });
    });
});

app.post('/profile/edit', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/');
    }

    let webUrl = req.body.web;
    if (
        !webUrl.startsWith('http://') &&
        !webUrl.startsWith('https://') &&
        webUrl.length !== 0
    ) {
        webUrl = '';
    }

    if (req.body.pwd === '') {
        Promise.all([
            db
                .updateProfile(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    req.session.userId
                )
                .catch(err => console.log('updateProfile error', err)),
            db
                .updateProfileOptional(
                    req.body.age || null,
                    req.body.city,
                    webUrl,
                    req.session.userId
                )
                .catch(err => console.log('updateProfileOptional', err))
        ])
            .then(() => {
                res.redirect('/petition');
            })
            .catch(err => console.log('updateProfileOptional', err));
    } else {
        hash(req.body.pwd).then(hashPwd =>
            Promise.all([
                db.updateProfilePassword(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hashPwd,
                    req.session.userId
                ),
                db
                    .updateProfileOptional(
                        req.body.age || null,
                        req.body.city,
                        webUrl,
                        req.session.userId
                    )
                    .catch(err => console.log('updateProfileOptional', err))
            ])
                .then(() => {
                    res.redirect('/petition');
                })
                .catch(err => console.log('updateProfileOptional', err))
        );
    }
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

app.listen(process.env.PORT || 8080, () => console.log('I am listening!!'));
