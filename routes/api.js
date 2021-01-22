const fs = require('fs');
const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');

// User model
const User = require('../models/User');

// Get one
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({
                error: false,
                foundId: false,
                message: "User with that Id doesn't exist"
            });
        }
        
        res.json({
            error: false,
            foundId: true,
            Id: {
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                birthdate: user.birthdate,
                phone: user.phone,
                email: user.email,
                avatarImageBase64: user.avatarImagePath,
                qrImageBase64: await user.qrImagePath
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

// Get avatar
router.get('/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user == null) {
            return res.sendStatus(404);
        }

        res.type(user.avatarImageType);
        res.send(user.avatarImage);
    }
    catch (error) {
        res.sendStatus(500);
    }
});

// Get QrCode
router.get('/:id/qr', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user == null) {
            return res.sendStatus(404);
        }

        res.type('image/png');
        res.send(await qrcode.toBuffer(`https://perid.tk/pid/${user.id}`));
    }
    catch (error) {
        res.status(500);
        res.type('image/png');
        res.send(fs.readFileSync('public/assets/NoQrAvailable.png'));
    }
});

module.exports = router;