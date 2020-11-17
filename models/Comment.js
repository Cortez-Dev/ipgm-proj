const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Reply = require('./Reply');

const Comment = new Schema({
    article_id: {type: Schema.Types.ObjectId, ref: 'Article'},
    author_id: {type: Schema.Types.ObjectId, ref: 'User'},
<<<<<<< HEAD
    comment: {type: String, trim: true},
=======
    comment : {type: String,trim: true},
    name : {type: String,trim: true},
>>>>>>> 21f6d7d054f84cf8fb396279398cb8b2eac4384e
}, {timestamps: true});

Comment.pre('remove', function(next) {
    Reply.remove({comment_id: this._id}).exec();
    next();
});

module.exports = mongoose.model('Comment', Comment);
