const express = require('express')
const router = express.Router()
const path = require('path');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');

express().set('views', path.join(__dirname, 'views'));
express().set('view engine', 'ejs')

router.get('/', ensureAuth, function (req, res) {
    res.render('pages/home', {articles: [
        {
            title: 'title1',
            desc: 'Desc1',
            genre: 'Comedy'
        },
        {
            title: 'title1',
            desc: 'Desc1',
            genre: 'Tragedy'
        },
        {
            title: 'title1',
            desc: 'Desc1',
            genre: 'Comedy'
        },
        {
            title: 'title1',
            desc: 'Desc1',
            genre: 'Politics'
        },
        {
            title: 'title1',
            desc: 'Desc1',
            genre: 'Tech'
        },
    ]});
});

router.post('/', ensureAuth, function(req, res) {
    const genre = req.body.genre;
    res.send({articles: [
        {
            title: 'title1',
            desc: 'Desc1',
            genre: 'Comedy'
        },
        {
            title: 'title1',
            desc: 'Desc1',
            genre: 'Tragedy'
        },
        {
            title: 'title1',
            desc: 'Desc1',
            genre: 'Comedy'
        },
        {
            title: 'title1',
            desc: 'Desc1',
            genre: 'Politics'
        },
        {
            title: 'title1',
            desc: 'Desc1',
            genre: 'Tech'
        },
    ]})
})

router.get('/someRoute', function (req, res) {
    res.send('Hello SomeRoute!');
});

module.exports = router
