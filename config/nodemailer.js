const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'main.perid.tk@gmail.com',
        pass: 'nush-zaben=basiles-bogiatzhs'
    }
});

module.exports = transporter;