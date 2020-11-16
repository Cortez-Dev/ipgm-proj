const express = require('express')
const router = express.Router()
const path = require('path');
const { ensureAuth } = require('../middleware/auth')

express().set('views', path.join(__dirname, 'views'));
express().set('view engine', 'ejs')

router.get('/', ensureAuth,function (req, res) {
    res.send('Home');
});
router.get('/someRoute', function (req, res) {
    res.send('Hello SomeRoute!');
});

module.exports = router
