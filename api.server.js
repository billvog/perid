// .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const app = express();

// Models
const ApiKey = require('./models/ApiKey');

// Connect to DB
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const database = mongoose.connection;
database.on('error', (error) => console.log(error));

// Enable trust proxy
app.set('trust proxy', 1);

// Middleware
app.use('/favicon.ico', express.static('public/assets/PeridIcon.svg'));
app.use(express.json());
app.use(rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    handler: (req, res) => {
        res.status(429).json({
            error: true,
            messge: 'Too many API requests from this IP, slow down.'
        });
    }
}));

// API key middleware
app.use('/:apiKey/', async (req, res, next) => {
    const apiKey = await ApiKey.findOne({
        key: req.params.apiKey
    });

    if (apiKey == null) {
        return res.status(401).json({
            error: true,
            message: "Invalid API key used"
        });
    }

    if (apiKey.doneRequests >= apiKey.totalRequests) {
        return res.status(401).json({
            error: true,
            message: "API usage limit for this key has been reached"
        });
    }

    apiKey.doneRequests++;
    apiKey.save().then(null).catch((error) => {
        if (error) {
            res.sendStatus(500);
            throw error;
        }
    });

    next();
});

// Routes
app.use('/:apiKey/', require('./routes/api'));
// 404 Error
app.use((req, res) => {
    res.sendStatus(404);
});

// Start server @ 5001
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Starting at port: ${PORT}`);
});