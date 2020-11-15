const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Reply = new Schema({
    comment_id: {type: Schema.Types.ObjectId, ref: 'Comment'},
    author_id: {type: Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true});

module.exports = mongoose.model('Reply', Reply);
