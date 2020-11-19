const express = require('express')
const router = express.Router();
const { check, validationResult } = require('express-validator');
const path = require('path');
const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const Article = require('../models/Article');
const Like = require('../models/Like');
const Follow = require('../models/Follow');

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
], ensureGuest, async function(req, res) {
    const errors = validationResult(req).errors;
    if(errors.length != 0) {
        res.render('pages/register', {
            errors:errors
        });
    } else {
        const email = req.body.emailsignup;
        const password = req.body.passwordsignup;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const age = req.body.age;

        const bool = await User.findOne({
            email: email
        }, function(err, data){
            if (err) {
                console.log(err)
            } else {
                if (data) {
                    return true;
                } else {
                    return false;
                }
            }
        })

        if(bool) {
            res.redirect('/users/register');
        } else {
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
                            req.flash('success','You are now registered and can log in');
                            res.redirect('/users/login');
                        }
                    });
                });
            });
        }
    }
});

router.get('/terms', ensureAuth, function(req, res){
    res.render('pages/terms')
})

router.post('/login', ensureGuest, function(req, res, next){
    passport.authenticate('local', {
      successRedirect:'/home',
      failureRedirect:'/users/login',
      failureFlash: true
    })(req, res, next);
});

// router.get('/dashboard', ensureAuth, async function (req, res) {
//     const user = req.user._id;
//     const profile = await Profile.findOne({user_id: user}, function(err, profile) {
//         if (err) {
//             console.log(err)
//         } else {
//             return profile;
//         }
//     });
//     const articles = [];
//     const likedArticles = [];
//     const excludedArticles = [];
//     const liked = await Like.find({user_id: user}, function(err, data) {
//         if(err) {
//             console.log(err);
//         } else {
//             return data;
//         }
//     })
//     for (const article of profile.articles) {
//         let pushArt = await Article.findById(article, function(err, article) {
//             if(err) {
//                 console.log(err);
//             } else {
//                 return article;
//             }
//         })
//         if(pushArt.exclude) {
//             excludedArticles.push(pushArt);
//         } else {
//             articles.push(pushArt);
//         }
//     }
//     for (const like of liked) {
//         let pushArt = await Article.findById(like.article_id, function(err, article) {
//             if(err) {
//                 console.log(err);
//             } else {
//                 return article;
//             }
//         })
//         if(pushArt !==null){
//           if(!pushArt.exclude) {
//               likedArticles.push(pushArt);
//           }
//         }

//     }
//     res.render('pages/dashboard', {
//         profile: profile,
//         articles: articles,
//         likedArticles: likedArticles,
//         excludedArticles: excludedArticles,
//     });
// });

router.get('/dashboard', ensureAuth, async (req, res) => {
    const user = req.user._id;
    const profile_user = await User.findById(user, function(err, data) {
        if (err) {
            console.log(err)
        } else {
            return data;
        }
    });
    const profile = await Profile.findOne({user_id: user}, function(err, profile) {
        if (err) {
            console.log(err)
        } else {
            return profile;
        }
    });
    res.render('pages/profile_edit', {
        profile: profile,
        profile_user: profile_user,
    });
});

router.post('/save', ensureAuth, function(req, res, next){
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const desc = req.body.desc;
    const user_id = req.user._id;
    Profile.findOneAndUpdate({
        user_id: user_id
    }, {
        firstName: firstName,
        lastName: lastName,
        desc: desc,
    }, function(err, data) {
        if (err) {
            console.log(err)
        } else {
            console.log('Profile Updated')
        }
    });
    res.redirect('/users/dashboard');
});

router.get('/articles', ensureAuth, async (req, res) => {
    const user = req.user._id;
    const profile = await Profile.findOne({user_id: user}, function(err, profile) {
        if (err) {
            console.log(err)
        } else {
            return profile;
        }
    });
    const articles = [];
    for (const article of profile.articles) {
        let pushArt = await Article.findById(article, function(err, article) {
            if(err) {
                console.log(err);
            } else {
                return article;
            }
        })
        if(!pushArt.exclude) {
            articles.push(pushArt);
        }
    }
    res.render('pages/user_articles', {
        profile: profile,
        articles: articles,
    });
});

router.get('/liked', ensureAuth, async (req, res) => {
    const user = req.user._id;
    const profile = await Profile.findOne({user_id: user}, function(err, profile) {
        if (err) {
            console.log(err)
        } else {
            return profile;
        }
    });
    const liked = await Like.find({user_id: user}, function(err, data) {
        if(err) {
            console.log(err);
        } else {
            return data;
        }
    });
    const likedArticles = [];
    for (const like of liked) {
        let pushArt = await Article.findById(like.article_id, function(err, article) {
            if(err) {
                console.log(err);
            } else {
                return article;
            }
        })
        if(pushArt !==null){
          if(!pushArt.exclude) {
              likedArticles.push(pushArt);
          }
        }

    }
    res.render('pages/liked_articles', {
        profile: profile,
        likedArticles: likedArticles,
    });
});

router.get('/reported', ensureAuth, async (req, res) => {
    const user = req.user._id;
    const profile = await Profile.findOne({user_id: user}, function(err, profile) {
        if (err) {
            console.log(err)
        } else {
            return profile;
        }
    });
    const excludedArticles = [];
    for (const article of profile.articles) {
        let pushArt = await Article.findById(article, function(err, article) {
            if(err) {
                console.log(err);
            } else {
                return article;
            }
        })
        if(pushArt.exclude) {
            excludedArticles.push(pushArt);
        }
    }    
    res.render('pages/reported_articles', {
        profile: profile,
        articles: excludedArticles,
    });
});

router.get('/followed', ensureAuth, async (req, res) => {
    const user = req.user._id;
    const profile = await Profile.findOne({user_id: user}, function(err, profile) {
        if (err) {
            console.log(err)
        } else {
            return profile;
        }
    });
    const followed = await Follow.find({
        user_id: user
    }, function(err, data){
        if(err){
            console.log(err)
        } else {
            return data;
        }
    });
    let articlesarray = [];
    for (const follow of followed) {
        let author = await Profile.findOne({
            user_id: follow.author_id
        }, function(err, data){
            if(err) {
                console.log(err)
            } else {
                return data;
            }
        });
        let pushArt = await Article.find({
            author_id: follow.author_id,
            status: 'private',
            exclude: false
        }, function(err, data){
            if(err) {
                console.log(err)
            } else {
                return data;
            }
        });
        articlesarray.push({
            author: author,
            articles: pushArt,
        })
    }
    console.log(articlesarray)
    res.render('pages/followed', {
        profile: profile,
        articlesarray: articlesarray,
    });
});

router.get('/logout', ensureAuth, (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});


router.get('/:id', ensureAuth, async function(req, res) {
    const author_id = req.params.id;
    const profile_user = await User.findById(author_id, function(err, data) {
        if (err) {
            console.log(err)
        } else {
            return data;
        }
    });
    const profile = await Profile.findOne({user_id: author_id}, function(err, data) {
        if (err) {
            console.log(err)
        } else {
            return data;
        }
    });
    const articles = [];
    for (const article of profile.articles) {
        let pushArt = await Article.findById(article, function(err, article) {
            if(err) {
                console.log(err);
            } else {
                return article;
            }
        })
        if(!pushArt.exclude) {
            articles.push(pushArt);
        }
    }
    res.render('pages/profile_view', {
        profile: profile,
        profile_user: profile_user,
        articles: articles,
    })
});

router.post('/:id/follow', ensureAuth, async function(req, res) {
    const user_id = req.user._id;
    const profile_id = req.params.id;
    if(user_id === profile_id) {
        res.send('You cannot follow yourself!')
    } else {
        let follow = await Follow.findOne({
        author_id: profile_id,
        user_id: user_id
        });
        if(follow) {
            res.send('You already follow the Author!')
        } else {
            follow = new Follow({
                author_id: profile_id,
                user_id: user_id
            });
            follow.save();
            res.send('You are now following the author!')
        }
    }
    
});

module.exports = router
