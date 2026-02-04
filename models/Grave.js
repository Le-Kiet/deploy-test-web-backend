const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  { _id: false }
);

const GraveSchema = new mongoose.Schema({
  // ⭐ thêm id auto increment
  id: {
    type: Number,
    unique: true,
    index: true
  },

  grave: { type: String, required: true },
  generation: { type: Number },
  location: { type: String, required: true },
  note: { type: String },

  geom: {
    type: PointSchema,
    required: true
  },

  images: { type: [String], default: [] },
  videos: { type: [String], default: [] }
});

GraveSchema.index({ geom: '2dsphere' });

module.exports = mongoose.model('Grave', GraveSchema);
