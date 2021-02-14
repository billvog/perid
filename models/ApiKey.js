const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
    ownerId: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true,
        default: () => crypto.randomBytes(16).toString('hex'),
        unique: true
    },
    totalRequests: {
        type: Number,
        required: true,
        default: 1000
    },
    doneRequests: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('ApiKey', apiKeySchema);