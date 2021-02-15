// .env
require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const auth = require('./config/auth');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const helmet = require('helmet');

const app = express();

// Passport config
require('./config/passport')(passport);

// Connect to DB
var dbConnectionString;
if (process.env.NODE_ENV == 'production') dbConnectionString = process.env.DB_URI;
else dbConnectionString = process.env.LOCAL_DB_URI;

mongoose.connect(dbConnectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const database = mongoose.connection;
database.on('error', (error) => console.log(error));

// Set view engine
app.set('view engine', 'ejs');
// Set trust proxt
app.set('trust proxy', true);

// Production Middleware
if (process.env.NODE_ENV == 'production') {
    app.use(compression());
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
              ...helmet.contentSecurityPolicy.getDefaultDirectives(),
              "img-src": ["'self'", "data:", "res.cloudinary.com"],
              "script-src": ["'self'", "'unsafe-inline'", "ajax.googleapis.com", "cdn.jsdelivr.net"],
              "script-src-attr": ["'unsafe-inline'"]
            },
          },
    }));
}

// Middleware
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ limit: '5mb', extended: false }));
app.use(require('method-override')('_m'));
app.use(require('express-flash')());
app.use(require('cookie-parser')());
app.use(require('express-session')({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
// Limit requests
app.use(rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 15,
    handler: (req, res) => {
        res.status(429).render('errors/429', {
            user: req.user || undefined
        });
    }
}));

// Session Manager Middleware
app.use(require('./config/session-manager'));

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
app.use('/dashboard', auth.ensureAuthenticated, auth.ensureVerified, require('./routes/dashboard'));
app.use('/docs', require('./routes/docs'));
// 403 Error
app.use('/public/*', (req, res) => {
    res.status(403).render('errors/403', { user: req.user || undefined });
});
// 404 Error
app.use((req, res) => {
    res.status(404).render('errors/404', { user: req.user || undefined });
});

// Start server @ 5000
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Starting at port: ${PORT}`);
});