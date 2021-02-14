require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const app = express();

// Connect to DB
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const database = mongoose.connection;
database.on('error', (error) => console.log(error));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ limit: '5mb', extended: false }));
app.use(rateLimit({
    windowMs: 1 * 60 * 1000, // 1 hour
    max: 60, // limit each IP to 60 requests per windowMs
    message: "Too many api requests, please try again after an hour"
}));

// Routes
app.use('/', require('./routes/api'));
// 404 Error
app.use((req, res) => {
    res.sendStatus(404);
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Starting at port: ${PORT}`);
});