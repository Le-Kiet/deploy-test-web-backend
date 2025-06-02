const mongoose = require('mongoose');

const AnniversarySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  anni_date: { type: String, required: true },
  event_name: { type: String, required: true },
  location_name: { type: String },
  address: { type: String },
  location_coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [lng, lat]
  },
  grave_coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  },
  note: { type: String }
});

AnniversarySchema.index({ location_coordinates: '2dsphere' });
AnniversarySchema.index({ grave_coordinates: '2dsphere' });

module.exports = mongoose.model('Anniversary', AnniversarySchema);
