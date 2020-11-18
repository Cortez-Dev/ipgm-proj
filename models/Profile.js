const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Profile = new Schema({
    user_id: {type: Schema.Types.ObjectId, ref: 'User'},
	firstName: {type: String, trim: true, default: ''},
    lastName: {type: String, trim: true, default: ''},
	age: {type: Number, default: 0},
    img: {type: String, trim: true, default: '/static/imgs/user.bmp'},
    desc: {type: String, trim: true, default: '.... quite a mysterious person'},
    articles: [{type: Schema.Types.ObjectId, ref: 'Article'}],
    likedArticles: [{type: Schema.Types.ObjectId, ref: 'Articles'}],
});

module.exports = mongoose.model('Profile', Profile);
