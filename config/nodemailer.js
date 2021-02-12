const nodemailer = require('nodemailer');

// Connect to my SMTP server
const transporter = nodemailer.createTransport({
    host: 'email-smtp.eu-central-1.amazonaws.com',
    port: 465,
    auth: {
        user: 'AKIAUVR55PW3I5APG25F',
        pass: 'BIIrfZKeQfSQvi2JPBZrceeTtNU7ntlhdVAolvVhKxjP'
    }
});

module.exports = transporter;