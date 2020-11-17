const express = require('express')
const router = express.Router()
const path = require('path');
const Article = require('../models/Article');
const fs = require('fs-extra');
const {
  ensureAuth,
  ensureAdmin
} = require('../middleware/auth');
const {
  appendFileSync
} = require('fs-extra');
const Profile = require('../models/Profile');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Reported = require('../models/Reported');
const Follow = require('../models/Follow');

express().set('views', path.join(__dirname, 'views'));
express().set('view engine', 'ejs')

router.get('/new', ensureAuth, function(req, res) {
  res.render('pages/newEditor');
});

router.post('/new/save', ensureAuth, async function(req, res) {
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
    if (err) {
      console.log(err)
    } else {
      const file = `articles/${article.author_id}/${article._id}.txt`;
      fs.outputFile(file, editor, err => {
        console.log(err);
      });
      Article.findByIdAndUpdate(article._id, {
        path: file
      }, function(err, newpath) {
        if (err) {
          console.log(err)
        } else {
          console.log(`New path: ${newpath}`);
        }
      })
      res.redirect('/home')
    }
  })
});

router.get('/:id', ensureAuth, function(req, res) {
  const article_id = req.params.id;
  Article.findById(article_id, function(err, article) {
    if (err) {
      console.log(err);
    } else {
      const filepath = article.path;
      fs.readFile(filepath, function(err, data) {
        if (err) {
          return console.error(err);
        }
        console.log(data.toString());
        console.log(article.author_id);
        Profile.find({
          user_id: article.author_id
        }, function(err, profile) {
          Comment.find({
            article_id: article_id
          }, function(err, comments) {
            var temp = {
              data: data.toString(),
              title: article.title,
              desc: article.desc,
              firstName: profile[0].firstName,
              lastName: profile[0].lastName,
              article_id: article_id,
              comments: comments
            };
            res.render('pages/article_view', temp);
          });
        });
      });
    }
  });
});

router.post('/comment-add', ensureAuth, async function(req, res) {
  console.log({
    comment: req.body.comment,
    article_id: req.body.article_id,
    author_id: req.user._id
  });
  Profile.find({
    user_id: req.user._id
  }, function(err, data) {
    var comment = new Comment({
      comment: req.body.comment,
      article_id: req.body.article_id,
      author_id: req.user._id,
      name: data[0].firstName + ' ' + data[0].lastName
    });
    comment.save();
    res.send({
      firstName: data[0].firstName,
      lastName: data[0].lastName
    });
  });
});

router.post('/like', ensureAuth, async function(req, res) {
  Like.find({
    article_id: req.body.article_id,
    user_id: req.user._id
  }, function(err, data) {
    if (data.length === 0) {
      var like = new Like({
        article_id: req.body.article_id,
        user_id: req.user._id
      });
      like.save();
      res.send("Liked");
    } else {
      res.send("Already Liked");
    }
  });
});

router.post('/flag', ensureAuth, async function(req, res) {
  Reported.find({
    article_id: req.body.article_id,
    user_id: req.user._id
  }, function(err, data) {
    if (data.length === 0) {
      var reported = new Reported({
        article_id: req.body.article_id,
        user_id: req.user._id
      });
      reported.save();
      res.send("Reported");
    } else {
      res.send("Already reported");
    }
  });
});

router.post('/follow', ensureAuth, async function(req, res) {
  var article_id = req.body.article_id;
  console.log(req.body.article_id);
  Article.find({
    _id: article_id
  }, function(err, article) {
    console.log({
      author_id: article[0].author_id,
      user_id: req.user._id
    });
    Follow.find({
      author_id: article[0].author_id,
      user_id: req.user._id
    }, function(err, data) {
      if (data.length === 0) {
        var follow = new Follow({
          author_id: article[0].author_id,
          user_id: req.user._id
        });
        follow.save();
        res.send("Followed");
      } else {
        res.send("Already Following");
      }
    });
  });
});

router.get('/edit/:id', ensureAuth, function(req, res) {
  const article_id = req.params.id;
  Article.findById(article_id, function(err, article) {
    if (err) {
      console.log(err);
    } else {
      const filepath = article.path;
      fs.readFile(filepath, function(err, data) {
        if (err) {
          return console.error(err);
        }
        console.log(data.toString());
        console.log(article.author_id);
        var temp = {
          data: data,
          article_id: article_id
        };
        res.render('pages/editArticles', temp);

      });
    }
  });
});

router.post('/old/save', ensureAuth, async function(req, res) {
  const article_id = req.body.article_id;
  Article.findById(article_id, function(err, article) {
    if (err) {
      console.log(err);
    } else {
      const file = article.path;
      fs.outputFile(file, req.body.editor, err => {
        console.log(err);
      });
      res.redirect('/home');
    }
  });
});

module.exports = router
