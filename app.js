require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');
const methodOverride = require('method-override');

const app = express();

// Passport config
require('./config/passport')(passport);

mongoose.connect(process.env.LOCAL_DB_URI || process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const database = mongoose.connection;
database.on('error', (error) => console.log(error));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: false }));
app.use(methodOverride('_m'));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/account', require('./routes/account'));
app.use('/api', require('./routes/api'));
app.use('/docs', require('./routes/docs'));
// 403 Error
app.use('/public/*', (req, res) => {
    res.status(403).render('errors/403', { user: req.user || undefined });
});
// 404 Error
app.use((req, res) => {
    res.status(404).render('errors/404', { user: req.user || undefined });
});

app.listen(process.env.PORT || 5000);