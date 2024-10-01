// const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressSession = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
require('dotenv').config();
const port = process.env.PORT || 3000; 
const indexRouter = require('./src/routes/router');
const usersRouter = require('./src/models/usermodel');
const User = require('./src/models/usermodel'); // Correct path to your user model

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

// Session setup
app.use(expressSession({
    saveUninitialized: false,
    resave: false,
    secret: process.env.SESSION_SECRET || 'default_secret',
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(logger(process.env.LOG_LEVEL || 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // This serves your static files

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 404 Error handling
app.use((req, res, next) => {
    next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error'); // Render an error page
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
module.exports = app;
