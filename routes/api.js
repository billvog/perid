const express = require('express');
const router = express.Router();

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
                avatarImageBase64: user.avatarImagePath
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

module.exports = router;