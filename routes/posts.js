// routes/posts.js
const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// Lấy tất cả post
router.get('/', async (req, res) => {
    const posts = await Post.find().populate('createdBy', 'username');
    res.json(posts);
});

// Thêm post
router.post('/', auth, async (req, res) => {
    const { title, content } = req.body;
    const post = new Post({ title, content, createdBy: req.userId });
    await post.save();
    res.json(post);
});

// Cập nhật post
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, req.body, { new: true });
    res.json(post);
});

// Xoá post
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    res.json({ message: 'Đã xoá' });
});

module.exports = router;
