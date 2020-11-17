const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Follow = new Schema({
    author_id: {type: Schema.Types.ObjectId, ref: 'Article'},
    user_id: {type: Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true});

module.exports = mongoose.model('Follow', Follow);
