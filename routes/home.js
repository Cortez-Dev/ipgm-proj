const express = require('express')
const router = express.Router()
const path = require('path');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');
const Article = require('../models/Article');

express().set('views', path.join(__dirname, 'views'));
express().set('view engine', 'ejs')

router.get('/', ensureAuth, async function (req, res) {
    const user = req.user._id;
    const articles = await Article.find({status: 'public', exclude: false}, function(err, articles) {
        if(err) {
            console.log(err)
        } else {
            return articles
        }
    }).sort({createdAt: 'descending'}).exec();
    res.render('pages/home', {
        articles: articles
    });
});

router.post('/', ensureAuth, async function(req, res) {
    const genre = req.body.genre;
    const articles = await Article.find({status: 'public', exclude: false, genre: genre}, function(err, articles) {
        if(err) {
            console.log(err)
        } else {
            return articles
        }
    }).sort({createdAt: 'descending'}).exec();
    res.send({articles: articles});
})

router.get('/someRoute', function (req, res) {
    res.send('Hello SomeRoute!');
});

module.exports = router
