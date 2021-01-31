// Models
const User = require('../models/User');
const Session = require('../models/Session');

module.exports = async function(req, res, next) {
    // Check if session id exists
    if ((req.cookies.sessid != null && req.cookies.sessid.length > 0) && !req.isAuthenticated()) {
        // Find session from db
        const session = await Session.findOne({
            sessionId: req.cookies.sessid
        });
        
        res.cookie('sessid', '', { maxAge: 0 });
        
        if (session != null) {
            // Find user from db
            const user = await User.findOne({
                _id: session.userId
            });
    
            if (user != null) {
                // Login found user
                req.login(user, (e) => {
                    if (e) throw e;
                });

                // Remove old sessions
                const oldSessions = await Session.find({
                    userId: user.id
                });

                oldSessions.forEach(async (s) => {
                    if (Date.parse(s.expires) <= Date.now() + (86400000 * 30)) {
                        await s.remove();
                    }
                });
    
                // Create new session
                const newSession = new Session({
                    userId: user.id
                });
    
                try {
                    await newSession.save();
                    res.cookie('sessid', newSession.sessionId, {
                        maxAge: 86400000 * 30 // 30 days
                    });
                }
                catch (e) {
                    throw e;
                }
            }
        }
    }
    // Check if user is authenticated
    else if ((req.cookies.sessid == null || req.cookies.sessid.length <= 0) && req.isAuthenticated()) {
        // Create new session
        const newSession = new Session({
            userId: req.user.id
        });

        try {
            await newSession.save();
            res.cookie('sessid', newSession.sessionId, {
                maxAge: 86400000 * 30 // 30 days
            });
        }
        catch (e) {
            throw e;
        }
    }

    next();
};