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
      default: undefined,
    },
  },
  { _id: false }
);

const AnniversarySchema = new mongoose.Schema({
  id: {
    type: Number,      // ⭐ string giữ 00001
    unique: true,
    index: true
  },

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

  images: { type: [String], default: [] },
  videos: { type: [String], default: [] },
});

AnniversarySchema.index({ location_coordinates: '2dsphere' }, { sparse: true });
AnniversarySchema.index({ grave_coordinates: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('Anniversary', AnniversarySchema);
