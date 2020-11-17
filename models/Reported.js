const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Reported = new Schema({
    article_id: {type: Schema.Types.ObjectId, ref: 'Article'},
    user_id: {type: Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true});

module.exports = mongoose.model('Reported', Reported);
