const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Email = new Schema({
    email: {type: String, trim: true, default: ''},
});

module.exports = mongoose.model('Email', Email);
