const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { createGroupSchema, joinGroupSchema, getGroupSchema } = require('../validators/schemas');

// Create Group
router.post('/', validate(createGroupSchema), async (req, res) => {
    try {
        const { groupName, userName, userEmail, phone } = req.body;

        // User creation logic remains the same
        let user = await User.findOne({ email: userEmail.toLowerCase() });
        if (!user) {
            user = await User.create({
                name: userName,
                email: userEmail.toLowerCase(),
                password: 'password123',
                ...(phone && { phone }),
            });
        } else if (phone) {
            user.phone = phone;
            await user.save();
        }

        let code;
        let groupExists = true;
        while (groupExists) {
            code = Math.random().toString(36).substring(2, 8).toUpperCase();
            groupExists = await Group.findOne({ code });
        }

        const group = await Group.create({
            name: groupName,
            code,
            members: [user._id],
        });

        const token = require('jsonwebtoken').sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod', {
            expiresIn: '30d',
        });

        res.status(201).json({ group, user, token });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to create group' });
    }
});

// Join Group
router.post('/join', validate(joinGroupSchema), async (req, res) => {
    try {
        const { code, userName, userEmail, phone } = req.body;
        const normalizedCode = code.toUpperCase();

        const group = await Group.findOne({ code: normalizedCode });
        if (!group) return res.status(404).json({ error: 'Group not found. Check the code.' });

        let user = await User.findOne({ email: userEmail.toLowerCase() });
        if (!user) {
            user = await User.create({
                name: userName,
                email: userEmail.toLowerCase(),
                password: 'password123',
                ...(phone && { phone }),
            });
        } else if (phone) {
            user.phone = phone;
            await user.save();
        }

        const isMember = group.members.some((id) => id.toString() === user._id.toString());
        if (!isMember) {
            group.members.push(user._id);
            await group.save();
            req.io.to(group._id.toString()).emit('group-updated', { type: 'member-joined', user });
        }

        const token = require('jsonwebtoken').sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod', {
            expiresIn: '30d',
        });

        res.json({ group, user, token });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to join group' });
    }
});

// Get Group Details
router.get('/:id', validate(getGroupSchema), async (req, res) => {
    try {
        const group = await Group.findById(req.params.id).populate('members', 'name email phone');
        if (!group) return res.status(404).json({ error: 'Group not found' });
        res.json(group);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to load group' });
    }
});

// Get User's Groups
router.get('/my-groups', protect, async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user._id })
            .populate('members', 'name')
            .sort({ createdAt: -1 });
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to load your groups' });
    }
});

module.exports = router;
