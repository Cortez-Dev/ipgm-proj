const express = require('express')
const router = express.Router()
const path = require('path');
const passport = require('passport');
const { ensureAuth, ensureAdmin, ensureGuest, ensureAdminGuest } = require('../middleware/auth');
const Article = require('../models/Article')
const User = require('../models/User')
const Profile = require('../models/Profile')
const fs = require('fs-extra');

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

router.get('/', ensureAdminGuest, function (req, res) {
    res.render('pages/admin_login');
});

router.post('/login', function(req, res, next){
    passport.authenticate('local', {
      successRedirect:'/admin/home',
      failureRedirect:'/admin',
      failureFlash: true
    })(req, res, next);
});

router.get('/home', ensureAdmin, async function (req, res) {
    const user = req.user._id;
    const articles = await Article.find({exclude: true}, function(err, articles) {
        if(err) {
            console.log(err)
        } else {
            return articles
        }
    }).sort({createdAt: 'descending'}).exec();
    res.render('pages/admin', {
        articles: articles
    });
});

router.get('/logout', ensureAdmin, (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/admin');
});

router.get('/warn/:user_id/:article_id', ensureAdmin, (req, res) => {
  Article.findById(req.params.article_id ,function(err,article){
    if (err){
      console.log(err);
    }else{
        sendEmailbyId(req.params.user_id,`Please change your article ${article.title} It violates our policy`);
        res.redirect('/admin/home');
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
  const title = article.title;
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
      sendEmailbyId(author,`Your article ${title} was deleted by the Admin for violating our policies.`)
    }
  });
  res.redirect('/admin/home');
});

module.exports = router
