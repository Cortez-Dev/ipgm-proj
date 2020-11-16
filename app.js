const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const connectDB = require('./config/database');

dotenv.config({path: './config/config.env'});

require('./config/passport')(passport)

connectDB();

const app = express()

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(methodOverride(function(req, res) {
  if (req.body && typeof req.body == 'object' && '_method' in req.body) {
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(session({
  secret: 'IPgm-project',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection}),
}))

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(passport.initialize())
app.use(passport.session())

app.use(function(req, res, next) {
  res.locals.user = req.user || null
  next()
})

app.use('/static', express.static('public'))

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use('/', require('./routes/welcome'));
app.use('/home', require('./routes/home'));
app.use('/admin', require('./routes/admin'));
app.use('/users', require('./routes/users'));

app.use(function(req, res){
  res.type('text/html');
  res.status(404);
  res.render('pages/404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('pages/500');
});

const PORT = process.env.PORT || 3000

app.listen(PORT, function () {
  console.log(`Follow the link: http://localhost:${PORT}/`);
});
