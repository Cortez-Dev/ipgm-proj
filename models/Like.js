const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Like = new Schema({
    article_id: {type: Schema.Types.ObjectId, ref: 'Article'},
    user_id: {type: Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true});

module.exports = mongoose.model('Like', Like);
