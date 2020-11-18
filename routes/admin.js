const express = require('express')
const router = express.Router()
const path = require('path');
const passport = require('passport');
const { ensureAuth, ensureAdmin, ensureGuest } = require('../middleware/auth');
const Article = require('../models/Article')
const User = require('../models/User')
const Profile = require('../models/Profile')

express().set('views', path.join(__dirname, 'views'));
express().set('view engine', 'ejs')

router.get('/', function (req, res) {
    res.render('pages/admin_login');
});

router.post('/login', function(req, res, next){
    passport.authenticate('local', {
      successRedirect:'/admin/home',
      failureRedirect:'/admin',
      failureFlash: true
    })(req, res, next);
});

router.get('/home', ensureAdmin, async function (req, res) {
    const user = req.user._id;
    const articles = await Article.find({exclude: true}, function(err, articles) {
        if(err) {
            console.log(err)
        } else {
            return articles
        }
    }).sort({createdAt: 'descending'}).exec();
    res.render('pages/admin', {
        articles: articles
    });
});

router.get('/logout', ensureAdmin, (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/admin');
});

module.exports = router
