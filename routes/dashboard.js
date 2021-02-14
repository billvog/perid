const express = require('express');
const router = express.Router();

// Models
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');

router.get('/', async (req, res) => {
    // Find user's api key
    const key = await ApiKey.findOne({
        ownerId: req.user.id
    });
    
    res.render('dashboard/index', {
        user: req.user,
        ApiKey: key || undefined
    });
});

router.post('/reset-api-key', async (req, res) => {
    try {
        // Find user's api key
        const key = await ApiKey.findOne({
            ownerId: req.user.id
        });

        // Create new key
        key.key = require('crypto').randomBytes(16).toString('hex');
        await key.save();

        // Redirect to dashboard
        req.flash('success_msg', "Your API access key has been reseted");
        return res.redirect('/dashboard/');
    }
    catch (error) {
        req.flash('error_msg', "An error occured while creating your new API key");
        return res.redirect('/dashboard/');
    }
});

module.exports = router;