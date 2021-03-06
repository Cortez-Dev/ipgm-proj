const express = require('express')
const router = express.Router()
const path = require('path');
const Article = require('../models/Article');
const fs = require('fs-extra');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');
const { appendFileSync } = require('fs-extra');
const Profile = require('../models/Profile');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const User = require('../models/User');

express().set('views', path.join(__dirname, 'views'));
express().set('view engine', 'ejs')

function sendEmailbyId(user_id,message) {
  User.find({_id:user_id},function(err,data){
  console.log("sending email to "+ data[0].email);
  var send = require('gmail-send')({
  user: 'articleium@gmail.com',
  pass: 'articleium-admin123',
  to:   data[0].email,
  subject: 'Articleium Notifications'
});
send({
  text:    message,
}, (error, result, fullResult) => {
  if (error) console.error(error);
  console.log(result);
})
  });
}

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
          console.log('Path Updated');
        }
      });
      Profile.findOneAndUpdate({user_id: article.author_id}, {
        $addToSet: { articles: [article._id] }
      }, function(err, profile) {
        if (err) {
          console.log(err)
        } else {
          console.log(`${profile._id} Updated`);
        }
      });
      res.redirect('/home')
    }
  })
});

router.post('/comment-add', ensureAuth, async function(req, res) {
  console.log({
    comment: req.body.comment,
    article_id: req.body.article_id,
    author_id: req.user._id
  });
  Profile.findOne({
    user_id: req.user._id
  }, function(err, data) {
    const comment = new Comment({
      comment: req.body.comment,
      article_id: req.body.article_id,
      author_id: req.user._id,
      name: data.firstName + ' ' + data.lastName
    });
    comment.save();
    Article.findOne({_id: req.body.article_id},function(err,article){
      sendEmailbyId(article.author_id,`${data.firstName} ${data.lastName} has commented on article ${article.title}`);
    });
    res.send({
      firstName: data.firstName,
      lastName: data.lastName
    });
  });
});

router.post('/like', ensureAuth, async function(req, res) {
  Like.find({
    article_id: req.body.article_id,
    user_id: req.user._id
  }, async function(err, data) {
    if (data.length === 0) {
      const like = new Like({
        article_id: req.body.article_id,
        user_id: req.user._id
      });
      like.save();
      const profile = await Profile.findOne({user_id: req.user._id}, function(err, data) {
        if(err) {
          console.log(err)
        } else {
          return data;
        }
      })
      const article = await Article.findById(req.body.article_id, function(err, data) {
        if(err) {
          console.log(err)
        } else {
          return data;
        }
      })
      User.findByIdAndUpdate(article.author_id, {
        $addToSet: {notifications: [`${profile.firstName} ${profile.lastName} has liked article ${article.title}`]}
      }, function(err, data) {
        if(err) {
          console.log(err)
        } else {
          console.log('Success')
        }
      })
      sendEmailbyId(article.author_id, `${profile.firstName} ${profile.lastName} has liked article ${article.title}`)
      res.send("Liked");
    } else {
      res.send("Already Liked");
    }
  });
});

router.post('/flag', ensureAuth, async function(req, res) {
  const article_id = req.body.article_id;
  const user_id = req.user._id;
  await Article.findByIdAndUpdate(article_id, {
    exclude: true
  }, async function(err, data){
    if (err) {
      console.log(err)
    } else {
      const profile = await Profile.findOne({user_id: user_id}, function(err, data) {
        if(err) {
          console.log(err)
        } else {
          return data;
        }
      })
      const article = await Article.findById(article_id, function(err, data) {
        if(err) {
          console.log(err)
        } else {
          return data;
        }
      })
      User.findByIdAndUpdate(article.author_id, {
        $addToSet: {notifications: [`${profile.firstName} ${profile.lastName} has reported article ${article.title}`]}
      }, function(err, data) {
        if(err) {
          console.log(err)
        } else {
          console.log('Report Success')
        }
      })
      sendEmailbyId(article.author_id, `${profile.firstName} ${profile.lastName} has reported article ${article.title}`)
    }
  })
  // Reported.find({
  //   article_id: req.body.article_id,
  //   user_id: req.user._id
  // }, function(err, data) {
  //   if (data.length === 0) {
  //     var reported = new Reported({
  //       article_id: req.body.article_id,
  //       user_id: req.user._id
  //     });
  //     reported.save();
  //     res.send("Reported");
  //   } else {
  //     res.send("Already reported");
  //   }
  // });
});

router.post('/follow', ensureAuth, async function(req, res) {
  const article_id = req.body.article_id;
  console.log(req.body.article_id);
  Article.findById(article_id, function(err, article) {
    const author_id = article.author_id;
    const user_id = req.user._id;
    console.log({
      author_id: typeof(article.author_id),
      user_id: typeof(req.user._id)
    });
    if (author_id.toString()===user_id.toString()) {
      res.send('You cannot follow yourself!')
    } else {
      Follow.findOne({
        author_id: article.author_id,
        user_id: req.user._id
      }, function(err, data) {
        if (data === null) {
          var follow = new Follow({
            author_id: article.author_id,
            user_id: req.user._id
          });
          follow.save();
          res.send("You are now following the author!");
        } else {
          res.send("You already follow the Author!");
        }
      });
    }
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
        Profile.findOne({
          user_id: article.author_id
        }, function(err, profile) {
          Comment.find({
            article_id: article_id
          }, function(err, comments) {
            var temp = {
              data: data.toString(),
              title: article.title,
              desc: article.desc,
              firstName: profile.firstName,
              lastName: profile.lastName,
              article_id: article_id,
              user_id: req.user._id.toString(),
              author_id: article.author_id.toString(),
              comments: comments
            };
            res.render('pages/article_view', temp);
          });
        });
      });
    }
  });
});

router.get('/delete/:id', ensureAuth, async function(req, res) {
  const article_id = req.params.id;
  const article = await Article.findById(article_id, function(err, article) {
    if (err) {
      console.log(err);
    } else {
      return article
    }
  });
  const author = article.author_id;
  const path = article.path;
  try {
    await fs.remove(path)
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
  await Article.findByIdAndDelete(article_id, function(err, article) {
    if (err) {
      console.log(err);
    } else {
      console.log('Deleted');
    }
  });
  await Profile.findOneAndUpdate({user_id: author}, {
    $pull: { articles: article_id }
  },function(err, profile) {
    if(err) {
      console.log(err);
    } else {
      console.log('Article removed from Profile');
    }
  });
  res.redirect('/users/dashboard');
});

router.post('/old/save', ensureAuth, async function(req, res) {
  const article_id = req.body.article_id;
  console.log(req.body.status);
  Article.update({_id:article_id},{$set:{status:req.body.status}},function(err,num){
  });
  Article.findByIdAndUpdate(article_id, {
    exclude: false,
  }, function(err, article) {
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
