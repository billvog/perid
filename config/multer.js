const multer = require('multer');
const crypto = require('crypto');

var storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'tmp/user-avatars/');
    },
    filename: (req, file, callback) => {
        callback(null, crypto.randomBytes(12).toString('hex'));
    }
});

var upload = multer({ storage });
module.exports = upload;