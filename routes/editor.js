const express = require('express')
const router = express.Router()
const path = require('path');
const Article = require('../models/Article');
const fs = require('fs-extra');
const { ensureAuth, ensureAdmin } = require('../middleware/auth')

express().set('views', path.join(__dirname, 'views'));
express().set('view engine', 'ejs')

router.get('/new', ensureAuth, function (req, res) {
    res.render('pages/editor');
});

router.post('/new/save', ensureAuth, function(req, res) {
    const editor = req.body.editor;
    const title = req.body.title;
    const desc = req.body.desc;
    const genre = req.body.genre;
    const status = req.body.status;
    const author_id = req.user._id;
    const newArticle = new Article({
        author_id: author_id,
        title: title,
        desc: desc,
        genre: genre,
        status: status,
    });
    newArticle.save(function(err, article) {
        if(err) {console.log(err)}
        const dir = `../articles/${article.author_id}/`
        fs.ensureDir(dir)
        .then(() => {
            fs.writeFile()
        })
        .catch(err => {
        console.error(err)
        })
    });
});

module.exports = router
