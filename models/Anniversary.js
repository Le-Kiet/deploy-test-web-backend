const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: undefined, // ⛔ Đây là mấu chốt: KHÔNG gán mảng rỗng mặc định
    },
  },
  { _id: false }
);

const AnniversarySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  anni_date: { type: String, required: true },
  event_name: { type: String, required: true },
  location_name: { type: String },
  address: { type: String },
  location_coordinates: {
    type: PointSchema,
    default: undefined,
  },
  grave_coordinates: {
    type: PointSchema,
    default: undefined,
  },
  note: { type: String },
});

// Chỉ tạo chỉ mục nếu trường tồn tại
AnniversarySchema.index({ location_coordinates: '2dsphere' }, { sparse: true });
AnniversarySchema.index({ grave_coordinates: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('Anniversary', AnniversarySchema);
