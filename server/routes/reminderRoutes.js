const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Reminder = require('../models/Reminder');
const { sendEmail } = require('../utils/email');
const validate = require('../middleware/validate');
const { createReminderSchema, getGroupRemindersSchema, sendReminderSchema } = require('../validators/schemas');

// List reminders for a group
router.get('/group/:groupId', validate(getGroupRemindersSchema), async (req, res) => {
    try {
        const reminders = await Reminder.find({ group: req.params.groupId })
            .populate('createdBy', 'name')
            .populate('forUser', 'name email')
            .sort({ dueDate: 1 });
        res.json(reminders);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to load reminders' });
    }
});

// Create reminder
router.post('/', validate(createReminderSchema), async (req, res) => {
    try {
        const { groupId, dueDate, message, userId, forUserId } = req.body;

        const group = await Group.findById(groupId).populate('members', 'name email phone');
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const reminder = await Reminder.create({
            group: groupId,
            createdBy: userId,
            forUser: forUserId || undefined,
            dueDate: new Date(dueDate),
            message: (message || 'Please settle your balance.').trim(),
        });
        const populated = await Reminder.findById(reminder._id)
            .populate('createdBy', 'name')
            .populate('forUser', 'name email');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to create reminder' });
    }
});

// Send reminder email to entire group (or to one member)
router.post('/send', validate(sendReminderSchema), async (req, res) => {
    try {
        const { groupId, memberId, message } = req.body;

        const group = await Group.findById(groupId).populate('members', 'name email phone');
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const subject = `Reminder: ${group.name} – settle up`;
        const textMessage = (message || 'Please settle your balance for this group.').trim();
        const html = `
          <p>Hi,</p>
          <p><strong>${textMessage}</strong></p>
          <p>Group: <strong>${group.name}</strong></p>
          <p>Log in to the app to see balances and settle up.</p>
        `;

        let targets = group.members;
        if (memberId) {
            const one = group.members.find((m) => m._id.toString() === memberId);
            if (one) targets = [one];
        }

        const sent = [];
        for (const member of targets) {
            if (member.email) {
                await sendEmail({ to: member.email, subject, text: textMessage, html });
                sent.push({ email: member.email, name: member.name });
            }
        }
        res.json({ success: true, sent: sent.length, emails: sent.map((s) => s.email) });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to send reminder' });
    }
});

// Stub: SMS reminder (wire to Twilio later)
router.post('/sms', async (req, res) => {
    try {
        const { phone, message } = req.body;
        if (!phone) return res.status(400).json({ error: 'Phone number required' });
        // TODO: Twilio integration. For now log and return success.
        console.log('[SMS stub] Would send to', phone, ':', (message || 'Reminder: please settle your balance.').substring(0, 50));
        res.json({ success: true, message: 'SMS reminder queued (stub)' });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to send SMS' });
    }
});

module.exports = router;
