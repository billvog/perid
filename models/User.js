const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const qrcode = require('qrcode');

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
    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    avatarImage: {
        type: Buffer,
        required: false
    },
    avatarImageType: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        require: true,
        index: true
    }
});

userSchema.virtual('avatarImagePath').get(function() {
    if (this.avatarImage != null && this.avatarImageType != null) {
        return `data:${this.avatarImageType};charset=utf-8;base64,${this.avatarImage.toString('base64')}`;
    }
    else {
        return null;
    }
});

userSchema.virtual('qrImagePath').get(async function() {
    try {
        return await qrcode.toDataURL(`https://perid.tk/pid/${this._id}`);
    }
    catch (error) {
        console.log(error);
        return null;
    }
});

module.exports = mongoose.model('User', userSchema);