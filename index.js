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
    res.redirect('/register');
});

app.get('/register', (req, res) => {
    res.render('register', {
        layout: 'main'
    });
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
        res.redirect('/register');
    }
    if (req.session.sigId) {
        res.redirect('/signed');
    } else {
        res.render('petition', {
            layout: 'main'
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
        res.redirect('/petition');
        return;
    }
    db.getSignature(req.session.sigId).then(({ rows }) => {
        let imageSig = rows[0].signature;

        db.selectSignature()
            .then(({ rows }) => {
                res.render('signed', {
                    layout: 'main',
                    num: rows[0].count,
                    image: imageSig
                });
            })
            .catch(err => {
                console.log('post error:', err);
            });
    });
});

app.get('/signers', (req, res) => {
    if (!req.session.sigId) {
        res.redirect('/petition');
        return;
    }

    db.getSigners().then(({ rows }) => {
        // console.log('signer rows', rows);
        res.render('signers', {
            layout: 'main',
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
            signers: rows
        });
    });
});

app.get('/profile', (req, res) => {
    res.render('profile', {
        layout: 'main'
    });
});

app.post('/profile', (req, res) => {
    // console.log('reqbody', req.body);

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

                res.redirect('/login');
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
        res.redirect('/register');
    }
    db.getProfile().then(({ rows }) => {
        // console.log(rows);
        res.render('edit', {
            layout: 'main',
            input: rows[rows.length - 1]
        });
    });
});

app.post('/profile/edit', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/register');
    }

    db.getProfileInput()
        .then(({ rows }) => {
            console.log('getProfileInput is :', rows[rows.length - 1]);

            res.render('edit', {
                layout: 'main',
                input: rows[rows.length - 1]
            });
        })
        .catch(err => {
            console.log('edit error', err);
        });

    db.getProfileInputOptional(
        req.body.age || null,
        req.body.city,
        req.body.web,
        req.session.userId
    )
        .then(({ rows }) => {
            console.log('getProfileInputOptional is :', rows[rows.length - 1]);
            res.render('edit', {
                layout: 'main',
                input: rows[rows.length - 1]
            });
        })
        .catch(err => {
            console.log('edit error', err);
        });

    res.redirect('/profile/edit');

    // res.redirect('/petition');
});

app.listen(process.env.PORT || 8080, () => console.log('I am listening!!'));
