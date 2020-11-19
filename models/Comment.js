const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comment = new Schema({
    article_id: {type: Schema.Types.ObjectId, ref: 'Article'},
    author_id: {type: Schema.Types.ObjectId, ref: 'User'},
    comment: {type: String,trim: true},
    name: {type: String,trim: true},
}, {timestamps: true});

module.exports = mongoose.model('Comment', Comment);
