const mongoose = require('mongoose');

const UpcomingAnniversarySchema = new mongoose.Schema({
  anniversary_id: { type: String, required: true }, // trỏ tới _id của bảng gốc
  anni_date: { type: String, required: true }, // vẫn lưu âm lịch nếu cần
  event_name: { type: String, required: true },
  days_remaining: { type: Number, required: true }, // còn bao nhiêu ngày nữa
  display_date: { type: Date, required: true }, // ngày dương lịch hiển thị thông báo
});

UpcomingAnniversarySchema.index({ display_date: 1, days_remaining: 1 });

module.exports = mongoose.model('UpcomingAnniversary', UpcomingAnniversarySchema);
