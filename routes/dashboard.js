const express = require('express');
const router = express.Router();
const auth = require('../config/auth');

// Models
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');

// API Access Key Plans
const plans = [
    {
        id: 'basic',
        title: 'Basic',
        limit: 1000
    }
]

router.get('/', async (req, res) => {
    // Find user's api key
    const key = await ApiKey.findOne({
        ownerId: req.user.id
    });

    let PlanFullTitle;
    if (key !== null) {
        for (const plan of plans) {
            if (key.totalRequests == plan.limit) {
                PlanFullTitle = `${plan.title} (${plan.limit} / month)`;
                break;
            }
        }
    }
    
    res.render('dashboard/index', {
        user: req.user,
        ApiKey: key || undefined,
        ApiKeyPlan: PlanFullTitle
    });
});

router.get('/create-api-key', auth.ensureNoApiKeyRegisted, async (req, res) => {
    res.render('dashboard/create-api-key', {
        user: req.user
    });
});

router.post('/create-api-key', auth.ensureNoApiKeyRegisted, async (req, res) => {
    const {
        plan: selectedPlan
    } = req.body;
    let errors = [];

    if (!selectedPlan) {
        errors.push({ message: 'Please fill all required fields' });
    }
    
    var totalRequests = null;
    if (selectedPlan) {
        // Find plan
        for (const plan of plans) {
            if (selectedPlan === plan.id) {
                totalRequests = plan.limit;
                break;
            }
        }

        if (totalRequests == null) {
            errors.push({ message: 'Please select a valid plan' });
        }
    }

    if (errors.length > 0) {
        return res.render('dashboard/create-api-key', {
            user: req.user,
            errors,
            // Input Fields
            selectedPlan
        });
    }

    const NewApiKey = new ApiKey({
        ownerId: req.user.id,
        totalRequests
    });

    NewApiKey.save().then(() => {
        req.flash('success_msg', 'Your API access key has been created');
        return res.redirect('/dashboard');
    }).catch((error) => {
        return res.render('dashboard/create-api-key', {
            user: req.user,
            errors: [{ message: error.message }],
            // Input Fields
            ownerId,
            selectedPlan
        });
    });
});

router.post('/reset-api-key', auth.ensureApiKeyRegisted, async (req, res) => {
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