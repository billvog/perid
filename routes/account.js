const fs = require('fs');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const auth = require('../config/auth');
const jwt = require('jsonwebtoken');

// Custom config
const mailer = require('../config/nodemailer');
const emailTemplates = require('../config/email-templates');
const multer = require('../config/multer');
const cloudinary = require('../config/cloudinary');

// Avatar values
const maxAvatarSize = 5000000;
const allowedImageFormats = [
    'image/jpeg', 'image/jpg', 'image/png'
];

// User model
const User = require('../models/User');

// Login page
router.get('/login', auth.ensureNotAuthenticated, (req, res) => {
    res.render('account/login');
});

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
                user: req.user.id,
                type: 'sessid'
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

// Logout page
router.delete('/logout', auth.ensureAuthenticated, async (req, res) => {
    // Delete session
    res.cookie('sessid', '', { maxAge: 0 });

    // Logout user
    req.logout();

    req.flash('success_msg', 'You are logged out');
    res.redirect('/account/login');
});

// Forgot password page
router.get('/forgot-password', auth.ensureNotAuthenticated, (req, res) => {
    res.render('account/forgot-password', {});
});

router.post('/forgot-password', auth.ensureNotAuthenticated, async (req, res) => {
    const {
        email
    } = req.body;
    let errors = [];

    // Validate fields
    if (!email) {
        errors.push({ message: 'Please fill a valid email address'});
    }

    if (email) {
        const foundUser = await User.findOne({ email });
        if (foundUser == null) {
            errors.push({ message: 'This email is not associated with a user'});
        }
        else {
            sendPasswordResetEmail(foundUser, (error, info) => {
                if (error) {
                    res.render('account/forgot-password', {
                        errors: [{ message: error.message }],
                        // Input Fields
                        email
                    });
                }
                else {
                    res.render('account/forgot-password', {
                        success_msg: "Password reset email has been sent (check spam folder)"
                    });
                }
            });
        }
    }

    if (errors.length > 0) {
        return res.render('account/forgot-password', {
            errors,
            // Input Fields
            email
        });
    }
});

// Reset password page
router.get('/reset-password/:token', auth.ensureNotAuthenticated, (req, res) => {
    const token = req.params.token;

    // Check if token is valid
    try {
        jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        return res.render('account/reset-password', {
            errors: [{ message: 'This token is not longer valid' }]
        });
    }
    
    res.render('account/reset-password', {
        token
    });
});

router.post('/reset-password', auth.ensureNotAuthenticated, async (req, res) => {
    const {
        token,
        password, passwordConfirm
    } = req.body;
    let errors = [];

    // Check for empty fields
    if (!token || !password || !passwordConfirm) {
        errors.push({ message: 'Please fill all required fields' });
    }

    // Validate password
    if (password.length < 6) {
        errors.push({ message: 'Password must be at least 6 characters' });
    }

    // Check if passwords match
    if (password && passwordConfirm && password !== passwordConfirm) {
        errors.push({ message: 'Passwords do not match' });
    }

    if (errors.length > 0) {
        return res.render('account/reset-password', {
            errors,
            // Input fields
            token
        });
    }

    try {
        const {
            user: id,
            type
        } = jwt.verify(token, process.env.JWT_SECRET);
        
        if (type == 'password-reset-token') {
            const foundUser = await User.findOne({ _id: id });

            // Check if new password is different from old
            if (bcrypt.compareSync(password, foundUser.password)) {
                return res.render('account/reset-password', {
                    errors: [{ message: 'Please create a new password that differs from your old one' }],
                    // Input fields
                    token
                });
            }

            // Set password
            bcrypt.hash(password, 10, async (error, hash) => {
                if (error) throw error;

                // Save user
                foundUser.password = hash;
                await foundUser.save();

                // Send email to inform
                mailer.sendMail({
                    from: 'Perid <no-reply@perid.tk>',
                    to: foundUser.email,
                    subject: 'Your password for Perid has changed',
                    // Generate email
                    html: emailTemplates.PasswordHasChanged(foundUser.firstName)
                }, (error, info) => {
                    // console.log(info, error);
                });

                return res.render('account/reset-password', {
                    success_msg: 'Your password has been changed'
                });
            });
        }
        else {
            return res.render('account/verify-email', {
                user: req.user || undefined,
                errors: [{ message: "This token cannot be validated" }]
            });
        }
    }
    catch (error) {
        if (error.name == 'TokenExpiredError') {
            return res.render('account/reset-password', {
                errors: [{ message: "This token has been expired" }],
                // Input fields
                token
            });
        }
        else {
            return res.render('account/reset-password', {
                errors: [{ message: "Invalid token. Please try sending the email again." }],
                // Input fields
                token
            });
        }
    }
});

// Verify email page
router.get('/verify-email', auth.ensureAuthenticated, auth.ensureNotVerified, (req, res) => {
    res.render('account/verify-email', {
        user: req.user
    });
});

// Handle account editing for unverified users
router.post('/verify-email', auth.ensureAuthenticated, auth.ensureNotVerified, async (req, res) => {
    const {
        action
    } = req.body;
    let errors = [];

    if (action == 'change-email') {
        const {
            email
        } = req.body;

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
    }
    else {
        res.sendStatus(400);
    }
});

// Handle email verification
router.get('/verify/:token', auth.ensureNotVerified, async (req, res) => {
    try {
        const {
            user: id,
            type
        } = jwt.verify(req.params.token, process.env.JWT_SECRET);

        if (type == 'account-verify-token') {
            await User.findOneAndUpdate({ _id: id }, {
                verified: true
            });
        }
        else {
            return res.render('account/verify-email', {
                user: req.user || undefined,
                errors: [{ message: "This token cannot be validated" }]
            });
        }
    }
    catch (error) {
        if (error.name == 'TokenExpiredError') {
            return res.render('account/verify-email', {
                user: req.user || undefined,
                errors: [{ message: "This token has been expired" }]
            });
        }
        else {
            return res.render('account/verify-email', {
                user: req.user || undefined,
                errors: [{ message: "Invalid token. Please try sending the email again." }]
            });
        }
    }

    req.flash('success_msg', 'Your account has been verified');
    res.redirect('/account/my-account');
});

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
                success_msg: "Verification email has been sent (check spam folder)"
            });
        }
    });
});

// Register page
router.get('/register', auth.ensureNotAuthenticated, (req, res) => {
    res.render('account/register');
});

router.post('/register', auth.ensureNotAuthenticated, multer.single('avatar'), async (req, res) => {
    const {
        firstName, middleName, lastName,
        birthdate,
        phone,
        email,
        password,
        passwordConfirm
    } = req.body;
    let errors = [];

    try {
        // Check for empty fields
        if (!firstName || !lastName || !birthdate || !email || !password || !passwordConfirm) {
            errors.push({ message: 'Please fill all the required fields' });
        }

        // Validate avatar
        const avatar = req.file;
        if (avatar) {
            if (avatar.size > maxAvatarSize) {
                errors.push({ message: 'Avatar is too big, 5MB is the maximum size' });
            }

            if (!allowedImageFormats.includes(avatar.mimetype)) {
                errors.push({ message: 'Disallowed avatar image format' });
            }
        }

        // Validate phone
        if (phone && !phone.match('^[+]?[0-9]+$')) {
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
            // Remove uploaded image from temp
            fs.rm(`tmp/user-avatars/${req.user.id}`, (err) => { if (err) throw err });

            return res.render('account/register', {
                errors,
                // Input Fields
                firstName, middleName, lastName,
                birthdate: birthdate || undefined,
                phone: phone || undefined,
                email
            });
        }

        const NewUser = new User({
            firstName, middleName, lastName,
            birthdate,
            phone: phone || null,
            email,
            password
        });

        // Set Avatar
        if (avatar && fs.existsSync(`tmp/user-avatars/${req.user.id}`)) {
            // Upload to cloud
            const uploadRes = await cloudinary.uploader.upload(`tmp/user-avatars/${req.user.id}`, {
                resource_type: 'image',
                public_id: `users/avatars/${req.user.id}`,
                overwrite: true,
                // Upload as 256x256
                transformation: [{ width: 256, height: 256, gravity: 'face', crop: 'fill' }]
            }, (error) => {
                // Remove uploaded image from temp
                fs.rm(`tmp/user-avatars/${req.user.id}`, (err) => { if (err) throw err });
                if (error) throw error;
            });

            // Attach url to user
            NewUser.avatarUrl = uploadRes.url;
        }
        else {
            NewUser.avatarUrl = null;
        }

        // Send email verification
        sendEmailVerification(NewUser);

        // Set password
        bcrypt.hash(password, 10, async (error, hash) => {
            if (error) throw error;
            NewUser.password = hash;

            // Save user
            await NewUser.save();

            // Login
            req.login(NewUser, (error) => {
                if (error) throw error;
                req.flash('success_msg', 'Your account has been registered');
                return res.redirect('/account/my-account');
            });
        });
    }
    catch (error) {
        throw error;
    }
});

// My account page
router.get('/my-account', auth.ensureAuthenticated, async (req, res) => {
    res.render('account/my-account', {
        user: req.user,
        userQrImage: await req.user.qrImagePath
    });
});

// Edit my account page
router.get('/my-account/edit', auth.ensureAuthenticated, (req, res) => {
    res.render('account/my-account', {
        user: req.user,
        edit: true
    });
});

router.post('/my-account/edit', auth.ensureAuthenticated, multer.single('avatar'), async (req, res) => {
    const {
        firstName, middleName, lastName,
        birthdate,
        phone,
        passwordConfirm
    } = req.body;
    let errors = [];

    try {
        // Check for empty fields
        if (!firstName || !lastName || !birthdate || !passwordConfirm) {
            errors.push({ message: 'Please fill all the required fields' });
        }

        // Validate avatar
        const avatar = req.file;
        if (avatar) {
            if (avatar.size > maxAvatarSize) {
                errors.push({ message: 'Avatar is too big, 5MB is the maximum size' });
            }
    
            if (!allowedImageFormats.includes(avatar.mimetype)) {
                errors.push({ message: 'Disallowed avatar image format' });
            }
        }

        // Validate phones
        if (phone && !phone.match('^[+]?[0-9]+$')) {
            errors.push({ message: 'Phone number is invalid' });
        }

        // Match password
        const isPasswordCorrect = await bcrypt.compare(passwordConfirm, req.user.password);
        if (!isPasswordCorrect) {
            errors.push({ message: 'Password is incorrect' });
        }

        if (errors.length > 0) {
            // Remove uploaded image from tmp
            if (fs.existsSync(`tmp/user-avatars/${req.user.id}`)) {
                fs.unlink(`tmp/user-avatars/${req.user.id}`, (error) => {
                    if (error) console.log(error);
                });
            }

            return res.render('account/my-account', {
                user: req.user,
                edit: true,
                errors,
                // Input Fields
                firstName, middleName, lastName,
                birthdate: birthdate || undefined,
                phone: phone || undefined
            });
        }

        // Update avatar
        if (avatar && fs.existsSync(`tmp/user-avatars/${req.user.id}`)) {
            // Upload to cloud
            const uploadRes = await cloudinary.uploader.upload(`tmp/user-avatars/${req.user.id}`, {
                resource_type: 'image',
                public_id: `users/avatars/${req.user.id}`,
                overwrite: true,
                // Upload as 256x256
                transformation: [{ width: 256, height: 256, gravity: 'face', crop: 'fill' }]
            }, (error) => {
                // Remove uploaded image from temp
                fs.unlink(`tmp/user-avatars/${req.user.id}`, (error) => {
                    if (error) console.log(error);
                });
                
                if (error) throw error;
            });

            // Attach url to user
            req.user.avatarUrl = uploadRes.url;
        }
        else if (req.body.remove_avatar == 'true') {
            // Remove url from database
            req.user.avatarUrl = null;
            // Remove file from cloud
            cloudinary.uploader.destroy(`users/avatars/${req.user.id}`, (error) => {
                if (error) throw error;
            });
        }
    
        req.user.firstName = firstName;
        req.user.middleName = middleName;
        req.user.lastName = lastName;
        req.user.birthdate = birthdate;
        req.user.phone = phone || null;
    
        // Save modified user
        await req.user.save();

        req.flash('success_msg', 'Your account has been modified');
        res.redirect('/account/my-account');
    }
    catch (error) {
        if (error) throw error;
    }
});

// Send email verification email
function sendEmailVerification(user, callback) {
    jwt.sign({
        user: user.id,
        type: 'account-verify-token'
    }, process.env.JWT_SECRET, {
        expiresIn: '10m'
    }, (error, token) => {
        if (error) return callback(error);

        mailer.sendMail({
            from: 'Perid <no-reply@perid.tk>',
            to: user.email,
            subject: 'Email verification for Perid',
            // Generate email
            html: emailTemplates.AccountVerification(user.firstName, `https://perid.tk/account/verify/${token}`)
        }, (error, info) => {
            // console.log(info, error);
            
            if (error) {
                callback(error);
            }
            else {
                callback(null, info);
            }
        });
    });
}

function sendPasswordResetEmail(user, callback) {
    jwt.sign({
        user: user.id,
        type: 'password-reset-token'
    }, process.env.JWT_SECRET, {
        expiresIn: '10m'
    }, (error, token) => {
        if (error) return callback(error);
        
        mailer.sendMail({
            from: 'Perid <no-reply@perid.tk>',
            to: user.email,
            subject: 'Password reset for Perid',
            // Generate email
            html: emailTemplates.PasswordReset(user.firstName, `https://perid.tk/account/reset-password/${token}`)
        }, (error, info) => {
            // console.log(info, error);
            
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