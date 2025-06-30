// jobs/shouldRunToday.js
const UpdateStatus = require('../models/UpdateStatus');

const shouldRunToday = async (taskName = 'upcoming_anniversaries') => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const record = await UpdateStatus.findOne({ task: taskName });

  if (!record || record.lastRunDate < today) {
    return true;
  }
  return false;
};

module.exports = shouldRunToday;
