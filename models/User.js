const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => nanoid(8)
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatarImage: {
        type: Buffer,
        required: false
    },
    avatarImageType: {
        type: String,
        required: false
    },
});

userSchema.virtual('avatarImagePath').get(function() {
    if (this.avatarImage != null && this.avatarImageType != null) {
        return `data:${this.avatarImageType};charset=utf-8;base64,${this.avatarImage.toString('base64')}`;
    }
    else {
        return null;
    }
});

module.exports = mongoose.model('User', userSchema);