const User = require('../models/User');

module.exports = {
    ensureAuth: function (req, res, next) {
      if (req.isAuthenticated()) {
        return next()
      } else {
        res.redirect('/users')
      }
    },

    ensureAdmin: function (req, res, next) {
      if (req.isAuthenticated()) {
        if(req.user.role === 'admin') {
          return next()
        } else {
          res.redirect('/admin')
        }
      } else {
        res.redirect('/users')
      }
    }
}
  