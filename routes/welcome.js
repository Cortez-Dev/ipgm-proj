const express = require('express')
const router = express.Router()
const path = require('path');

express().set('views', path.join(__dirname, 'views'));
express().set('view engine', 'ejs')

router.get('/', function (req, res) {
    res.render('pages/welcome');
});

module.exports = router
