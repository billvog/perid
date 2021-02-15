// Models
const ApiKey = require('../models/ApiKey');

module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        else {
            req.flash('error_msg', 'Please login to view this page');
            res.redirect('/account/login');
        }
    },
    ensureNotAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect('/account/my-account');
        }
        else {
            return next();
        }
    },
    ensureVerified: function(req, res, next) {
        if (req.user && req.user.verified) {
            return next();
        }
        else {
            req.flash('error_msg', 'Please verify your account first');
            res.redirect('/account/my-account');
        }
    },
    ensureNotVerified: function(req, res, next) {
        if (req.user && req.user.verified) {
            res.redirect('/account/my-account');
        }
        else {
            return next();
        }
    },
    ensureApiKeyRegisted: async function(req, res, next) {
        if (await ApiKey.findOne({ ownerId: req.user.id }) == null) {
            res.redirect('/dashboard');
        }
        else {
            return next();
        }
    },
    ensureNoApiKeyRegisted: async function(req, res, next) {
        if (await ApiKey.findOne({ ownerId: req.user.id }) != null) {
            req.flash('error_msg', "An API key is already registered on your account");
            res.redirect('/dashboard');
        }
        else {
            return next();
        }
    }
};