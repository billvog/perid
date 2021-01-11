const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render('index', {
        user: req.user || undefined
    });
});

module.exports = router;