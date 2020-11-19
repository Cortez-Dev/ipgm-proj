const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
	email: {type: String, trim: true, required: true},
    password_hash: {type:String, trim: true, required: true},
    role: {type: String, enum: ['user', 'admin'], default: 'user'},
    notifications: [{type: String, trim: true}],
});

module.exports = mongoose.model('User', User);
