const mongoose = require('mongoose');
const ms = require('ms')

const Subscription = new mongoose.Schema({
    login_id: {type: mongoose.Schema.Types.ObjectId, ref:'Login'},
	createdAt: {type: Date, expires: ms('28 days'), default: Date.now}
});

module.exports = mongoose.model('Subscription', Subscription);
