const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { z } = require('zod');

const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
    }),
});

const registerSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().optional(),
    }),
});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod', {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password, // Hashed by pre-save hook
            phone: phone || '',
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
    });
});

module.exports = router;
