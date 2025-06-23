// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now }
});

// Helper: so sánh mật khẩu
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
