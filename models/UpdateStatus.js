// models/UpdateStatus.js
const mongoose = require('mongoose');

const updateStatusSchema = new mongoose.Schema({
  task: { type: String, required: true, unique: true },
  lastRunDate: { type: Date, required: true }
});

module.exports = mongoose.model('UpdateStatus', updateStatusSchema);
