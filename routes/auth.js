// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'gravemapigeo'; // Nên để vào .env





// Đăng ký
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({ username, passwordHash, email });
        await user.save();
        res.json({ message: 'Đăng ký thành công' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Đăng ký thất bại' });
    }
});

// Đăng nhập
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ email: req.body.email });

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'Sai username hoặc password' });

        const match = await user.comparePassword(password);
        if (!match) return res.status(401).json({ error: 'Sai username hoặc password' });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Đăng nhập thất bại' });
    }
});

module.exports = router;
