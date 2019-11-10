const express = require('express');
const app = express();
const hb = require('express-handlebars');
const db = require('./utils/db');
const cookieSession = require('cookie-session');
// const signedUser = (req, res, next) => {
//     if (req.session.sigId && req.url !== '/signed') {
//         res.redirect('/signed');
//     }
//     next();
// };

app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

app.use(express.urlencoded({ extended: false }));
app.use(
    cookieSession({ secret: `my secret`, maxAge: 1000 * 60 * 60 * 24 * 14 })
);
// app.use(signedUser);
app.use(express.static('./public'));

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
    // console.log("made it to peition route");
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

app.get('/participants', (req, res) => {
    res.render('participants', {
        layout: 'main'
    });
});

app.listen(8080, () => console.log('I am listening!!'));
