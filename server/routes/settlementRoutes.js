const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Group = require('../models/Group');
const Settlement = require('../models/Settlement');

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

// Record a settlement (fromUser paid toUser)
router.post('/', async (req, res) => {
    try {
        const { groupId, fromUserId, toUserId, amount } = req.body;
        if (!groupId || !isValidId(groupId)) return res.status(400).json({ error: 'Invalid group' });
        if (!fromUserId || !isValidId(fromUserId)) return res.status(400).json({ error: 'Invalid payer' });
        if (!toUserId || !isValidId(toUserId)) return res.status(400).json({ error: 'Invalid payee' });
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return res.status(400).json({ error: 'Amount must be positive' });

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        const members = group.members.map((id) => id.toString());
        if (!members.includes(fromUserId) || !members.includes(toUserId)) return res.status(403).json({ error: 'Both users must be group members' });
        if (fromUserId === toUserId) return res.status(400).json({ error: 'Cannot settle with yourself' });

        const settlement = await Settlement.create({
            group: groupId,
            fromUser: fromUserId,
            toUser: toUserId,
            amount: numAmount,
        });
        const populated = await Settlement.findById(settlement._id)
            .populate('fromUser', 'name')
            .populate('toUser', 'name');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to record settlement' });
    }
});

// Get settlements for a group
router.get('/group/:groupId', async (req, res) => {
    try {
        if (!isValidId(req.params.groupId)) return res.status(400).json({ error: 'Invalid group id' });
        const settlements = await Settlement.find({ group: req.params.groupId })
            .populate('fromUser', 'name')
            .populate('toUser', 'name')
            .sort({ date: -1 });
        res.json(settlements);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to load settlements' });
    }
});

module.exports = router;
