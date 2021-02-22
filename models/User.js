const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const qrcode = require('qrcode');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => nanoid(8),
  },
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Date,
    required: true,
  },
  phone: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  avatarUrl: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    require: true,
    index: true,
  },
  tokenVersion: {
    type: Number,
    default: 0,
    required: true,
  },
});

userSchema.virtual('qrImagePath').get(async function () {
  try {
    return await qrcode.toDataURL(`https://perid.tk/pid/${this._id}`);
  } catch (error) {
    console.log(error);
    return null;
  }
});

module.exports = mongoose.model('User', userSchema);
