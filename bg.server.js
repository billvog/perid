// .evn
require('dotenv').config();

const mongoose = require('mongoose');
const Agenda = require('agenda');

// Models
const ApiKey = require('./models/ApiKey');

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

// Setup agenda
const agenda = new Agenda().mongo(database, 'jobs', (error, result) => {
    if (error) console.log(error);
});

agenda.define("reset api done requests", async (job) => {
    ApiKey.updateMany({}, {
        $set: {
            doneRequests: 0
        }
    }).then(() => {
        console.log('Reseted done-requests count');
    }).catch((error) => {
        console.log(error);
    });
});

(async function () {
    await agenda.start();
    await agenda.every("1 month", "reset api done requests");
})();