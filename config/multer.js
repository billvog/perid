const multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'tmp/user-avatars/');
    },
    filename: (req, file, callback) => {
        callback(null, req.user.id);
    }
});

var upload = multer({ storage });
module.exports = upload;