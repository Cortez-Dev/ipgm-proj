const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Profile = require('./Profile');
const Article = require('./Article');
const Subscription = require('./Subscription');

const User = new Schema({
	email: {type: String, trim: true, required: true},
    password_hash: {type:String, trim: true, required: true}
});

User.pre('remove', function(next) {
    Profile.remove({login_id: this._id}).exec();
    Article.remove({author_id: this._id}).exec();
    Subscription.remove({login_id: this._id}).exec();
    Comment.remove({author_id: this._id}).exec();
    next();
});

module.exports = mongoose.model('User', User);
