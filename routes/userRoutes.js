const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Thêm user mới
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra user đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
