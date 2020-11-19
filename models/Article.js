const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Article = new Schema({
	author_id: {type: Schema.Types.ObjectId, ref:'User'},
    collabs: [{type: Schema.Types.ObjectId, ref:'User'}],
    title: {type: String, trim: true, default: "Title"},
    desc: {type: String, trim: true, default: "Description"},
    path: {type: String, trim: true, default: ""},
    genre: {type: String, trim: true},
    viewcount: {type: Number, default: 0},
    likes: {type: Number, default: 0},
    dislikes: {type: Number, default: 0},
    status: {type: String, enum: ['public', 'private'], default: 'public'},
    exclude: {type: Boolean, default: false},
}, {timestamps: true});

module.exports = mongoose.model('Article', Article);
