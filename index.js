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
app.get('/register', (req, res) => {
    res.render('register', {
        layout: 'main'
    });
});

app.post('/register', (req, res) => {
    // console.log('first', req.body.first);
    // console.log('last', req.body.last);
    // console.log('email', req.body.email);
    // console.log('pwd', req.body.pwd);

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
                    // console.log('hashpwd', hashPwd);
                    req.session.userId = rows[0].id;
                    res.redirect('/signed');
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
    let password = req.body.pwd;

    db.getPwd(email).then(({ rows }) => {
        let hashedPwd = rows[0].password;
        compare(password, hashedPwd).then(match => {
            if (match === true) {
                req.session.userId = rows[0].id;
            }
        });
    });
});

app.get('/petition', (req, res) => {
    if (req.session.sigId) {
        res.redirect('/signed');
    } else {
        res.render('petition', {
            layout: 'main'
        });
    }
});

app.post('/petition', (req, res) => {
    console.log('rec body', req.body);

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
    db.getSig(req.session.sigId).then(({ rows }) => {
        let imageSig = rows[0].signature;

        db.selectSig()
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
        console.log('signer rows', rows);
        res.render('signers', {
            layout: 'main',
            signers: rows
        });
    });
});

app.listen(8080, () => console.log('I am listening!!'));
