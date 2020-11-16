const express = require('express')
const router = express.Router()
const path = require('path');
const { check, validationResult } = require('express-validator');
const Email = require('../models/Email')

express().set('views', path.join(__dirname, 'views'));
express().set('view engine', 'ejs')

router.get('/', function (req, res) {
    res.render('pages/welcome');
});

router.post('/', [
    check('email', 'Please enter a valid Email').isEmail(),
    check('email', 'Email field is required').not().isEmpty(),
], function (req, res) {
    const email = req.body.email;
    const errors = validationResult(req);
    if(errors.array().length != 0){
        res.render('pages/welcome', {
        errors: errors.array()
        });
    } else {
        Email.findOne({email: email})
        .then((email) => {
            if(!email) {
                const newEmail = new Email({email: email});
                newEmail.save(function(err){
                    if(err) console.log(err)
                })
            } else {
                errors = 'Email already exists'
            }
        })
        .catch((err) => console.log(err))
    }
});

module.exports = router
