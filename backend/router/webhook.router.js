const crypto = require('crypto');
const express = require('express');
const Lead = require('../module/leadSchema');
const { fetchLead } = require('../services/meta.service');

const router = express.Router();

router.get(['/webhook', '/webhookcheck'], (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && process.env.VERIFY_TOKEN && token === process.env.VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    return res.status(403).json({ message: 'Webhook verification failed' });
});

function hasValidSignature(req) {
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
        return false;
    }

    const signature = req.get('x-hub-signature-256') || '';
    if (!/^sha256=[a-f0-9]{64}$/i.test(signature) || !req.rawBody) {
        return false;
    }

    const expected = `sha256=${crypto
        .createHmac('sha256', appSecret)
        .update(req.rawBody)
        .digest('hex')}`;
    const receivedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    return receivedBuffer.length === expectedBuffer.length
        && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

function getNotifications(body) {
    const notifications = [];
    for (const entry of Array.isArray(body.entry) ? body.entry : []) {
        for (const change of Array.isArray(entry.changes) ? entry.changes : []) {
            if (change.field !== 'leadgen' || !change.value) {
                continue;
            }
            const value = change.value;
            const leadId = value.leadgen_id || value.leadId;
            if (leadId) {
                notifications.push({ ...value, leadId: String(leadId), page_id: value.page_id || entry.id });
            }
        }
    }

    if (notifications.length === 0 && body.leadId) {
        notifications.push({ ...body, leadId: String(body.leadId) });
    }
    return [...new Map(notifications.map((item) => [item.leadId, item])).values()];
}

async function saveNotification(notification, io) {
    const existing = await Lead.findOne({ leadId: notification.leadId });
    if (existing) {
        return { lead: existing, created: false };
    }

    const details = await fetchLead(notification.leadId, notification);
    try {
        const lead = await Lead.create(details);
        io.emit('new_lead', lead.toObject());
        return { lead, created: true };
    } catch (error) {
        if (error.code !== 11000) {
            throw error;
        }
        const lead = await Lead.findOne({ leadId: notification.leadId });
        if (!lead) {
            throw error;
        }
        return { lead, created: false };
    }
}

router.post(['/webhook', '/webhookcheck'], async (req, res) => {
    console.log(`Meta webhook received: ${req.method} ${req.path}`);
    if (!hasValidSignature(req)) {
        console.error('Meta webhook rejected: invalid signature; check META_APP_SECRET');
        return res.status(401).json({ message: 'Invalid Meta webhook signature' });
    }

    const notifications = getNotifications(req.body || {});
    if (notifications.length === 0) {
        console.error('Meta webhook rejected: no leadgen notifications in payload');
        return res.status(400).json({ message: 'Webhook payload contains no leadgen notifications' });
    }

    try {
        const saved = [];
        for (const notification of notifications) {
            saved.push(await saveNotification(notification, req.app.get('io')));
        }
        const created = saved.filter((result) => result.created).length;
        console.log(`Meta webhook processed: ${created} new lead(s)`);
        return res.status(200).json({
            received: true,
            created,
        });
    } catch (error) {
        console.error('Error processing Meta lead webhook:', error.message);
        return res.status(502).json({ message: 'Unable to retrieve or save the Meta lead' });
    }
});

module.exports = router;
