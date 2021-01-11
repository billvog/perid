const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

const { ensureAuthenticated, ensureNotAuthenticated } = require('../config/auth');

// User model
const User = require('../models/User');

// Register page
router.get('/register', ensureNotAuthenticated, (req, res) => {
    res.render('account/register');
});

// Login page
router.get('/login', ensureNotAuthenticated, (req, res) => {
    res.render('account/login');
});

// Logout page
router.delete('/logout', ensureAuthenticated, (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/account/login');
});

// My Account page
router.get('/my-account', ensureAuthenticated, async (req, res) => {
    res.render('account/my-account', {
        user: await req.user,
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

        req.login(user, (error) => {
            if (error) return next(error);
            return res.redirect('/account/my-account');
        });
    })(req, res, next);
});

// Handle register
router.post('/register', async (req, res) => {
    const { firstName, middleName, lastName, birthdate, phone, email, password, passwordConfirm } = req.body;
    let errors = [];

    if (!firstName || !lastName || !birthdate || !phone || !email || !password || !passwordConfirm) {
        errors.push({ message: 'Please fill all the required fields' });
    }

    if (password.length < 6) {
        errors.push({ message: 'Password must be at least 6 characters' });
    }

    if (password !== passwordConfirm) {
        errors.push({ message: 'Passwords do not match' });
    }
    
    if (errors.length > 0) {
        return res.render('account/register', {
            errors,
            firstName,
            middleName,
            lastName,
            birthdate: birthdate || undefined,
            phone,
            email
        });
    }

    User.findOne({ email }).then(user => {
        if (user) {
            errors.push({ message: 'This email is already registered' });
            return res.render('account/register', {
                errors,
                firstName,
                middleName,
                lastName,
                birthdate,
                phone,
                email
            });
        }

        const newUser = new User({
            firstName,
            middleName,
            lastName,
            birthdate,
            phone,
            email,
            password
        });
    
        bcrypt.genSalt(10, (error, salt) => {
            bcrypt.hash(password, salt, (error, hash) => {
                if (error) throw error;
                newUser.password = hash;
        
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
});

// Handle edit
router.post('/edit', async (req, res) => {
    const { firstName, middleName, lastName, birthdate, phone, email, passwordConfirm } = req.body;
    let errors = [];

    if (!firstName || !lastName || !birthdate || !phone || !email || !passwordConfirm) {
        errors.push({ message: 'Please fill all the required fields' });
    }

    // Match password
    const isPasswordCorrect = await bcrypt.compare(passwordConfirm, req.user.password);
    if (!isPasswordCorrect) {
        errors.push({ message: 'Password is incorrect' });
    }

    if (errors.length > 0) {
        return res.render('account/my-account', {
            query: { edit: '' },
            errors,
            firstName,
            middleName,
            lastName,
            birthdate: birthdate || undefined,
            phone,
            email
        });
    }

    User.findOne({ email: email }).then(user => {
        if (user && user.id != req.user.id) {
            errors.push({ message: 'This email is already registered' });
            return res.render('account/my-account', {
                query: { edit: '' },
                errors,
                firstName,
                middleName,
                lastName,
                birthdate: birthdate || undefined,
                phone,
                email
            });
        }

        req.user.firstName = firstName;
        req.user.middleName = middleName;
        req.user.lastName = lastName;
        req.user.birthdate = birthdate;
        req.user.phone = phone;
        req.user.email = email;
    
        req.user.save()
        .then((user) => {
            req.flash('success_msg', 'Your account has been modified');
            res.redirect('/account/my-account');
        })
        .catch((error) => {
            console.log(error);
        });
    });
});

module.exports = router;