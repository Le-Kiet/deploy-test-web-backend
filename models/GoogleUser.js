const mongoose = require('mongoose');

const googleUserSchema = new mongoose.Schema({
  uid: String,
  email: String,
  displayName: String,
  status: { type: String, default: 'pending' }, // 'pending' | 'approved'
});

module.exports = mongoose.model('GoogleUser', googleUserSchema);
