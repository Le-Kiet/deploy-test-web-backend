const mongoose = require('mongoose');

const GraveSchema = new mongoose.Schema({
  grave: { type: String, required: true },
  generation: { type: Number },
  location: { type: String, required: true },
  note: { type: String },
  geom: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  images: { type: [String], default: [] },   // ✅ sửa từ String → [String]
  videos: { type: [String], default: [] }    // ✅ sửa từ String → [String]
});

GraveSchema.index({ geom: '2dsphere' });

module.exports = mongoose.model('Grave', GraveSchema);
