const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Reply = require('./Reply');

const Comment = new Schema({
    article_id: {type: Schema.Types.ObjectId, ref: 'Article'},
    author_id: {type: Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true});

Comment.pre('remove', function(next) {
    Reply.remove({comment_id: this._id}).exec();
    next();
});

module.exports = mongoose.model('Comment', Comment);
