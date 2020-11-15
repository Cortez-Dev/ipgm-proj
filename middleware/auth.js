const Profile = require('../models/Profile')
const Subscription = require('../models/Subscription')

module.exports = {
    ensureAuth: function (req, res, next) {
      if (req.isAuthenticated()) {
        return next()
      } else {
        res.redirect('/')
      }
    },
}
  