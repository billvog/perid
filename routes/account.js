const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const { ensureAuthenticated, ensureNotAuthenticated } = require('../config/auth');

// User model
const User = require('../models/User');
const Session = require('../models/Session');

// Register page
router.get('/register', ensureNotAuthenticated, (req, res) => {
    res.render('account/register');
});

// Login page
router.get('/login', ensureNotAuthenticated, (req, res) => {
    res.render('account/login');
});

// Logout page
router.delete('/logout', ensureAuthenticated, async (req, res) => {
    // Delete session
    await Session.deleteOne({ sessionId: req.cookies.sessid });
    res.cookie('sessid', '', { maxAge: 0 });

    // Logout user
    req.logout();

    req.flash('success_msg', 'You are logged out');
    res.redirect('/account/login');
});

// My Account page
router.get('/my-account', ensureAuthenticated, async (req, res) => {
    res.render('account/my-account', {
        user: req.user,
        userQrImage: await req.user.qrImagePath,
        query: req.query
    });
});

// Handle login
router.post('/login', (req, res, next) => {
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
            const newSession = new Session({
                userId: req.user.id
            });

            try {
                await newSession.save();
                res.cookie('sessid', newSession.sessionId, {
                    maxAge: 2592000000 // 30 days
                });

                return res.redirect('/account/my-account');
            }
            catch (e) {
                throw e;
            }
        });
    })(req, res, next);
});

// Handle register
router.post('/register', async (req, res) => {
    const {
        firstName, middleName, lastName,
        birthdate,
        phone, homePhone, workPhone,
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
    const phoneRegexVal = '^[+]?[0-9]+$';
    if (!phone.match(phoneRegexVal)) {
        errors.push({ message: 'Phone number is invalid' });
    }
    if (homePhone && !homePhone.match(phoneRegexVal)) {
        errors.push({ message: 'Home phone is invalid' });
    }
    if (workPhone && !workPhone.match(phoneRegexVal)) {
        errors.push({ message: 'Work phone is invalid' });
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
            phone, homePhone, workPhone,
            email
        });
    }

    const newUser = new User({
        firstName, middleName, lastName,
        birthdate,
        phone, homePhone, workPhone,
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
                phone, homePhone, workPhone,
                email
            });
        }
    });

    // Set password
    bcrypt.genSalt(10, (error, salt) => {
        bcrypt.hash(password, salt, (error, hash) => {
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
});

// Handle edit
router.post('/edit', async (req, res) => {
    const {
        firstName, middleName, lastName,
        birthdate,
        phone, homePhone, workPhone,
        email,
        passwordConfirm
    } = req.body;
    let errors = [];

    // Check for empty fields
    if (!firstName || !lastName || !birthdate || !phone || !email || !passwordConfirm) {
        errors.push({ message: 'Please fill all the required fields' });
    }

    // Validate phones
    const phoneRegexVal = '^[+]?[0-9]+$';
    if (!phone.match(phoneRegexVal)) {
        errors.push({ message: 'Phone number is invalid' });
    }
    if (homePhone && !homePhone.match(phoneRegexVal)) {
        errors.push({ message: 'Home phone is invalid' });
    }
    if (workPhone && !workPhone.match(phoneRegexVal)) {
        errors.push({ message: 'Work phone is invalid' });
    }

    // Match password
    const isPasswordCorrect = await bcrypt.compare(passwordConfirm, req.user.password);
    if (!isPasswordCorrect) {
        errors.push({ message: 'Password is incorrect' });
    }

    // Check if email is registered
    const userWithThisEmail = await User.findOne({ email: email })
    if (userWithThisEmail && userWithThisEmail.id != req.user.id) {
        errors.push({ message: 'This email is already registered' });
    }

    if (errors.length > 0) {
        return res.render('account/my-account', {
            user: req.user,
            query: { edit: '' },
            errors,
            // Input Fields
            firstName, middleName, lastName,
            birthdate: birthdate || undefined,
            phone, homePhone, workPhone,
            email
        });
    }

    req.user.firstName = firstName;
    req.user.middleName = middleName;
    req.user.lastName = lastName;
    req.user.birthdate = birthdate;
    req.user.phone = phone;
    req.user.homePhone = homePhone;
    req.user.workPhone = workPhone;
    req.user.email = email;

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
                    phone, homePhone, workPhone,
                    email
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

module.exports = router;