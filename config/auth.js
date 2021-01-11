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
    }
};