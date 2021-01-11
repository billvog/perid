const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// User model
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(new LocalStrategy({
        usernameField: 'email'
    }, (email, password, done) => {
        // Match user
        User.findOne({
            email
        })
        .then(user => {
            if (!user) {
                return done(null, false, {
                    message: 'This email is not registered'
                });
            }

            // Match password
            bcrypt.compare(password, user.password, (error, isMatch) => {
                if (error) throw error;

                if (isMatch) {
                    return done(null, user);
                }
                else {
                    return done(null, false, {
                        message: 'Password is incorrect'
                    });
                }
            });
        })
        .catch(error => {
            console.log(error);
        })
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (error, user) => {
            done(error, user);
        });
    });
};