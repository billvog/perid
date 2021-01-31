const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        default: () => uuidv4()
    },
    userId: {
        type: String,
        required: true
    },
    expires: {
        type: Date,
        required: true,
        default: () => Date.now()
    }
});

module.exports = mongoose.model('Session', sessionSchema);