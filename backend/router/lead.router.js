const express = require('express');
const router = express.Router();
const Lead = require('../module/leadSchema');

router.get('/leads', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdTime: -1, createdAt: -1 }).lean();
        res.status(200).json(leads);
    } catch (error) {
        console.error('Error while fetching leads:', error.message);
        res.status(500).json({ message: 'Error while fetching leads' });
    }
});

router.get('/leads/:id', async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id).lean();
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        return res.status(200).json(lead);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid lead id' });
        }
        console.error('Error while fetching lead:', error.message);
        return res.status(500).json({ message: 'Error while fetching lead' });
    }
});

module.exports = router;