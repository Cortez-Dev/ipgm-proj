const express = require('express')
const router = express.Router()
const path = require('path');
const passport = require('passport');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');

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

router.get('/home', ensureAdmin, function (req, res) {
    res.send('Admin Home');
});

module.exports = router
