const express = require('express')
const router = express.Router();
const { check, validationResult } = require('express-validator');
const path = require('path');
const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureGuest } = require('../middleware/auth');

express().set('views', path.join(__dirname, 'views'));
express().set('view engine', 'ejs')

router.get('/login', ensureGuest, function (req, res) {
    res.render('pages/login');
});

router.get('/register', ensureGuest, function (req, res) {
    res.render('pages/register');
});

router.post('/register', [
    check('emailsignup', 'Please enter a valid Email').isEmail().trim().escape(),
    check('emailsignup', 'Email field is required').trim().not().isEmpty().escape(),
    check('passwordsignup', 'Please enter a password').trim().isLength({ min: 8, max:20 }),
    check('passwordsignup', 'Password field is required').trim().not().isEmpty(),
    check('passwordsignup_confirm').custom((value, { req }) => {
        if (value !== req.body.passwordsignup) {
          throw new Error('Entered password does not match the given password');
        }
        return true;
      }),
    check('firstName', 'Please enter your First Name').trim().not().isEmpty().escape(),
    check('lastName', 'Please enter your Last Name').trim().not().isEmpty().escape(),
    check('age', 'Please enter your Age').isNumeric(),
], ensureGuest,function(req, res) {
    const errors = validationResult(req);
    if(errors.array().length != 0) {
        console.log(errors.array())
    } else {
        const email = req.body.emailsignup;
        const password = req.body.passwordsignup;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const age = req.body.age;

        let newUser = new User({
            email: email,
            password_hash: password
        });
    
        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newUser.password_hash, salt, function(err, hash){
                if(err){
                    console.log(err);
                }
                newUser.password_hash = hash;
                newUser.save(function(err, newUser){
                    if(err){
                        console.log(err);
                        return;
                    } else {
                        const user_id = newUser._id;
                        const newProfile = new Profile ({
                            user_id: user_id,
                            firstName: firstName,
                            lastName: lastName,
                            age: age,
                        });
                        newProfile.save(function(err) {
                            if(err) {console.log(err)}
                        });
                        res.redirect('/users');
                    }
                });
            });
        });

    }
});

router.post('/login', ensureGuest, function(req, res, next){
    passport.authenticate('local', {
      successRedirect:'/home',
      failureRedirect:'/users',
      failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});

module.exports = router
