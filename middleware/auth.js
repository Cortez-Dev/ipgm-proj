const User = require('../models/User');

module.exports = {
    ensureAuth: function (req, res, next) {
      if (req.isAuthenticated()) {
        return next()
      } else {
        res.redirect('/users/login')
      }
    },

    ensureAdmin: function (req, res, next) {
      console.log(req.user)
      if (req.isAuthenticated()) {
        if(req.user.role === 'admin') {
          return next()
        } else {
          res.redirect('/admin')
        }
      } else {
        res.redirect('/users/login')
      }
    },

    ensureGuest: function(req, res, next) {
      if (req.isAuthenticated()) {
        res.redirect('/home')
      } else {
        return next()
      }
    }

    // ensureAuthor: function (req, res, next) {
    //   if (req.isAuthenticated()) {
    //     if(req.user._id === req.article.user_id) {
    //       return next()
    //     } else {
    //       res.redirect('/admin')
    //     }
    //   } else {
    //     res.redirect('/users')
    //   }
    // },

}
  