const express = require('express');
const router = express.Router();

router.get('/api', async (req, res) => {
    res.render('docs/api', {
        user: req.user || undefined
    });
});

module.exports = router;