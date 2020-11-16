const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Comment = require('./Comment');

const Article = new Schema({
	author_id: {type: Schema.Types.ObjectId, ref:'User'},
    collabs: [{type: Schema.Types.ObjectId, ref:'User'}],
    title: {type: String, trim: true, default: "Title"},
    desc: {type: String, trim: true, default: "Description"},
    path: {type: String, trim: true, default: ""},
    genres: {type: Array, default: []},
    viewcount: {type: Number, default: 0},
    likes: {type: Number, default: 0},
    dislikes: {type: Number, default: 0},
    status: {type: String, enum: ['public', 'private'], default: 'public'},
    exclude: {type: Boolean, default: false},
}, {timestamps: true});

Article.pre('remove', function(next) {
    Comment.remove({article_id: this._id}).exec();
    next();
});

module.exports = mongoose.model('Article', Article);
