const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');

// User model
const User = require('../models/User');

router.get('/', async (req, res) => {
    res.render('index', {
        user: req.user || undefined
    });
});

router.get('/pid/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user == null) {
        return res.render('view-pid', {
            user: req.user || undefined,
            error: "User with that Id doesn't exist"
        });
    }

    qrcode.toDataURL(`https://perid.tk/pid/${user.id}`, async (error, url) => {
        if (error) console.log(error);
        
        res.render('view-pid', {
            user: req.user || undefined,
            foundUser: user,
            foundUserQrImage: await user.qrImagePath
        });
    });
});

module.exports = router;