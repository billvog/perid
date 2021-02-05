const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const auth = require('../config/auth');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// User model
const User = require('../models/User');

// Nodemailer
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'main.perid.tk@gmail.com',
        pass: 'nush-zaben=basiles-bogiatzhs'
    }
});

// Register page
router.get('/register', auth.ensureNotAuthenticated, (req, res) => {
    res.render('account/register');
});

// Login page
router.get('/login', auth.ensureNotAuthenticated, (req, res) => {
    res.render('account/login');
});

// Logout page
router.delete('/logout', auth.ensureAuthenticated, async (req, res) => {
    // Delete session
    res.cookie('sessid', '', { maxAge: 0 });

    // Logout user
    req.logout();

    req.flash('success_msg', 'You are logged out');
    res.redirect('/account/login');
});

// My Account page
router.get('/my-account', auth.ensureAuthenticated, async (req, res) => {
    res.render('account/my-account', {
        user: req.user,
        userQrImage: await req.user.qrImagePath,
        query: req.query
    });
});

// Verify email page
router.get('/verify-email', auth.ensureAuthenticated, auth.ensureNotVerified, (req, res) => {
    res.render('account/verify-email', {
        user: req.user
    });
});

// Handle login
router.post('/login', auth.ensureNotAuthenticated, (req, res, next) => {
    const { email } = req.body;

    passport.authenticate('local', (error, user, info) => {
        if (error) return next(error);

        if (!user) {
            return res.render('account/login', {
                error_msg: info.message,
                email
            });
        }

        req.login(user, async (error) => {
            if (error) return next(error);

            // Create new session
            jwt.sign({
                user: req.user.id
            }, process.env.JWT_SECRET, {
                expiresIn: '30d'
            }, (error, sessid) => {
                if (error) throw error;

                // Save token in cookie
                res.cookie('sessid', sessid, {
                    maxAge: 2592000000 // 30 days
                });

                return res.redirect('/account/my-account');
            });
        });
    })(req, res, next);
});

// Handle email verification
router.post('/send-email-verification', auth.ensureAuthenticated, auth.ensureNotVerified, (req, res) => {
    sendEmailVerification(req.user, (error, info) => {
        if (error) {
            res.render('account/verify-email', {
                user: req.user,
                errors: [{ message: error.message }]
            });
        }
        else {
            res.render('account/verify-email', {
                user: req.user,
                success_msg: "Verification email has been sent"
            });
        }
    });
});

router.get('/verify/:token', auth.ensureNotVerified, async (req, res) => {
    try {
        const { user: id } = jwt.verify(req.params.token, process.env.JWT_SECRET);
        await User.findOneAndUpdate({ _id: id }, {
            verified: true
        });
    }
    catch (error) {
        if (error.name == 'TokenExpiredError') {
            return res.render('account/verify-email', {
                user: req.user || undefined,
                errors: [{ message: "This token has been expired" }]
            });
        }

        console.log(error);
    }

    req.flash('success_msg', 'Your account has been verified');
    res.redirect('/account/my-account');
});

// Handle register
router.post('/register', auth.ensureNotAuthenticated, async (req, res) => {
    const {
        firstName, middleName, lastName,
        birthdate,
        phone,
        email,
        password,
        passwordConfirm
    } = req.body;
    let errors = [];

    // Check for empty fields
    if (!firstName || !lastName || !birthdate || !phone || !email || !password || !passwordConfirm) {
        errors.push({ message: 'Please fill all the required fields' });
    }

    // Validate phones
    if (!phone.match('^[+]?[0-9]+$')) {
        errors.push({ message: 'Phone number is invalid' });
    }

    // Validate password
    if (password.length < 6) {
        errors.push({ message: 'Password must be at least 6 characters' });
    }

    // Check if passwords match
    if (password && passwordConfirm && password !== passwordConfirm) {
        errors.push({ message: 'Passwords do not match' });
    }
    
    // Check if email is registered
    if (await User.findOne({ email: email }) != null) {
        errors.push({ message: 'This email is already registered' });
    }

    if (errors.length > 0) {
        return res.render('account/register', {
            errors,
            // Input Fields
            firstName, middleName, lastName,
            birthdate: birthdate || undefined,
            phone,
            email
        });
    }

    const newUser = new User({
        firstName, middleName, lastName,
        birthdate,
        phone,
        email,
        password
    });

    // Set Avatar
    const avatar = req.body.avatar;
    saveUserAvatar(newUser, avatar, (error) => {
        if (error) {
            errors.push({ message: error });
            return res.render('account/register', {
                query: { edit: '' },
                errors,
                // Input Fields
                firstName, middleName, lastName,
                birthdate: birthdate || undefined,
                phone,
                email
            });
        }
    });

    // Send email verification
    sendEmailVerification(newUser);

    // Set password
    bcrypt.hash(password, 10, (error, hash) => {
        if (error) throw error;
        newUser.password = hash;

        // Save user
        newUser.save()
        .then(() => {
            // Login
            req.login(newUser, (error) => {
                if (error) throw error;

                req.flash('success_msg', 'Your account has been registered');
                return res.redirect('/account/my-account');
            });
        })
        .catch((error) => {
            console.log(error);
        });
    });
});

// Handle email editing while not verified (in case of miss-typed email)
router.post('/edit/email', auth.ensureAuthenticated, auth.ensureNotVerified, async (req, res) => {
    const {
        email
    } = req.body;
    let errors = [];

    // Check for empty fields
    if (!email) {
        errors.push({ message: 'Please fill a valid email adress' });
    }

    // Check if the same email is used
    if (email == req.user.email) {
        errors.push({ message: 'This email is already is use by you' });
    }
    // Check if email is registered
    else if (await User.findOne({ email: email }) != null) {
        errors.push({ message: 'This email is already registered' });
    }

    if (errors.length > 0) {
        return res.render('account/verify-email', {
            user: req.user,
            query: { prompt: 'change-email' },
            errors,
            // Input Fields
            email
        });
    }

    req.user.email = email;

    // Save modified user
    req.user.save()
    .then(() => {
        req.flash('success_msg', 'Your email has been changed');
        res.redirect('/account/verify-email');
    })
    .catch((error) => {
        console.log(error);
    });
});

// Handle edit
router.post('/edit', auth.ensureAuthenticated, async (req, res) => {
    const {
        firstName, middleName, lastName,
        birthdate,
        phone,
        passwordConfirm
    } = req.body;
    let errors = [];

    // Check for empty fields
    if (!firstName || !lastName || !birthdate || !phone || !passwordConfirm) {
        errors.push({ message: 'Please fill all the required fields' });
    }

    // Validate phones
    if (!phone.match('^[+]?[0-9]+$')) {
        errors.push({ message: 'Phone number is invalid' });
    }

    // Match password
    const isPasswordCorrect = await bcrypt.compare(passwordConfirm, req.user.password);
    if (!isPasswordCorrect) {
        errors.push({ message: 'Password is incorrect' });
    }

    if (errors.length > 0) {
        return res.render('account/my-account', {
            user: req.user,
            query: { edit: '' },
            errors,
            // Input Fields
            firstName, middleName, lastName,
            birthdate: birthdate || undefined,
            phone
        });
    }

    req.user.firstName = firstName;
    req.user.middleName = middleName;
    req.user.lastName = lastName;
    req.user.birthdate = birthdate;
    req.user.phone = phone;

    // Update Avatar
    if (typeof req.body.avatar !== 'undefined') {
        const avatar = req.body.avatar;
        saveUserAvatar(req.user, avatar, (error) => {
            if (error) {
                errors.push({ message: error });
                return res.render('account/my-account', {
                    user: req.user,
                    query: { edit: '' },
                    errors,
                    // Input Fields
                    firstName, middleName, lastName,
                    birthdate: birthdate || undefined,
                    phone
                });
            }
        });
    }

    // Save modified user
    req.user.save()
    .then(() => {
        req.flash('success_msg', 'Your account has been modified');
        res.redirect('/account/my-account');
    })
    .catch((error) => {
        console.log(error);
    });
});

function saveUserAvatar(user, avatarEncoded, callback) {
    if (avatarEncoded == null) return callback(null);

    try {
        const avatar = JSON.parse(avatarEncoded);
        if (avatar.size >= 5242880) {
            return callback('Avatar file is too large');
        }
    
        const imageFileType = avatar.type.split('/')[0];
        if (imageFileType != 'image') {
            return callback(`Incorrect file format ${imageFileType}`);
        }
    
        user.avatarImage = new Buffer.from(avatar.data, 'base64');
        user.avatarImageType = avatar.type;
    }
    catch (error) {
        if (error.name == 'SyntaxError') {
            user.avatarImage = null;
            user.avatarImageType = '';
            return callback(null);
        }
        
        return callback(error.message);
    }
    
    callback(null);
}

function sendEmailVerification(user, callback) {
    jwt.sign({
        user: user.id
    }, process.env.JWT_SECRET, {
        expiresIn: '10m'
    }, (error, token) => {
        if (error) return callback(error);

        const url = `http://localhost:5000/account/verify/${token}`;
        
        transporter.sendMail({
            from: 'Perid.tk <main.perid.tk@gmail.com>',
            to: user.email,
            subject: 'Email verification from Perid.tk',
            html: `
            <div style='font-family:Arial,Helvetica,sans-serif !important; padding:15px 20px; border-radius:5px; background-color:#212529; color:#C3C4C5 !important;'>
            <h2>Verify your email address for Perid.tk</h2>
            <p>Click <a target='_blank' href="${url}" style='color:gold;'>here</a> to verify your email address or click the following link:<br>
            <a target='_blank' href="${url}" style='color:goldenrod;'>${url}</a></p>
            <p>This email has been sent by a no-reply email account. Any reply will be ignored.</p>
            </div>
            `
        }, (error, info) => {
            if (error) {
                callback(error);
            }
            else {
                callback(null, info);
            }
        });
    });
}

module.exports = router;