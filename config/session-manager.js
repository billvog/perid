const jwt = require('jsonwebtoken');

// Models
const User = require('../models/User');

module.exports = async function(req, res, next) {
    // Check if session id exists
    if ((req.cookies.sessid != null && req.cookies.sessid.length > 0) && !req.isAuthenticated()) {
        try {
            // Get assoc uid from jwt
            const { user: id } = jwt.verify(req.cookies.sessid, process.env.JWT_SECRET);
            const user = await User.findOne({ _id: id });

            // Clear cookie
            res.cookie('sessid', '', { maxAge: 0 });

            if (user != null) {
                // Login found user
                req.login(user, (e) => {
                    if (e) throw e;
                });
    
                // Create new session
                const sessid = await jwt.sign({
                    user: user.id
                }, process.env.JWT_SECRET, {
                    expiresIn: '30d'
                });

                // Save token in cookie
                res.cookie('sessid', sessid, {
                    maxAge: 2592000000 // 30 days
                });
            }
        }
        catch (error) {
            throw error;
        }
    }
    // Check if user is authenticated
    else if ((req.cookies.sessid == null || req.cookies.sessid.length <= 0) && req.isAuthenticated()) {
        // Create new session
        const sessid = await jwt.sign({
            user: req.user.id
        }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });
        
        // Save token in cookie
        res.cookie('sessid', sessid, {
            maxAge: 2592000000 // 30 days
        });
    }

    next();
};