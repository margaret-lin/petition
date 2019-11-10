const express = require('express');
const app = express();
const hb = require('express-handlebars');
const db = require('./utils/db');
const csurf = require('csurf');
const cookieSession = require('cookie-session');

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

    db.userInfo(req.body.first, req.body.last, req.body.sig)
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
