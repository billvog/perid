const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('docs/index', {
        user: req.user || undefined
    });
});

// Terms of Service
router.get('/tos', (req, res) => {
    res.render('docs/tos', {
        user: req.user || undefined
    });
});

// Privacy Policy
router.get('/privacy-policy', (req, res) => {
    res.render('docs/privacy-policy', {
        user: req.user || undefined
    });
});

module.exports = router;