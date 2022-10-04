const express = require('express')
const router = express.Router()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const db = require('../database/db')

const verify = (username, password, done) => {
    db.users.findByUsername(username, (err, user) => {
        if (err) {
            return done(err)
        }
        if (!user) {
            return done(null, false)
        }

        if (!db.users.verifyPassword(user, password)) {
            return done(null, false)
        }

        return done(null, user)
    })
}

const options = {
    usernameField: "username",
    passwordField: "password",
}

passport.use('local', new LocalStrategy(options, verify))

passport.serializeUser((user, cb) => {
    cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
    db.users.findById(id, (err, user) => {
        if (err) {
            return cb(err)
        }
        cb(null, user)
    })
})



router.get('/', (req, res) => {
    res.render('index', {
        user: req.user,
        title: 'Главная'
    })
})

router.get('/api/user/login', (req, res) => {
    res.render('user/login')
})

router.post('/api/user/login',
    passport.authenticate('local', {
        failureRedirect: '/api/user/login'
    }),
    (req, res) => {
        console.log("req.user: ", req.user)
        res.redirect('/')
    }
)


router.get('/api/user/signup', (req, res) => {
    res.render('user/signup')
})

router.post('/api/user/signup', async (req, res) => {
    db.users.addUser(res.req.body)
    res.redirect('/');
})


router.get('/api/user/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
})

router.get('/api/user/me',
    (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/api/user/login')
        }
        next()
    },
    (req, res) => {
        res.render('user/profile', {
            user: req.user
        })
    }
)

module.exports = router