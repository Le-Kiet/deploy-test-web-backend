const express = require('express');
const router = express.Router();
const Anniversary = require('../models/Anniversary');

// GET all
router.get('/', async (req, res) => {
  const data = await Anniversary.find();
  res.json(data);
});

// POST new
router.post('/', async (req, res) => {
  try {
    const {
      id, anni_date, event_name,
      location_name, address, location_coordinates,
      grave_coordinates, note
    } = req.body;

    const newAnni = new Anniversary({
      id, anni_date, event_name,
      location_name, address,
      location_coordinates: location_coordinates
        ? { type: 'Point', coordinates: [location_coordinates[0], location_coordinates[1]] }
        : undefined,
      grave_coordinates: grave_coordinates
        ? { type: 'Point', coordinates: [grave_coordinates[0], grave_coordinates[1]] }
        : undefined,
      note
    });

    await newAnni.save();
    res.status(201).json({ message: 'Thêm sự kiện thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const data = await Anniversary.findOne({ id: req.params.id });
    if (!data) return res.status(404).json({ message: 'Không tìm thấy dữ liệu' });

    Object.assign(data, {
      ...req.body,
      location_coordinates: req.body.location_coordinates
        ? { type: 'Point', coordinates: [req.body.location_coordinates[0], req.body.location_coordinates[1]] }
        : data.location_coordinates,
      grave_coordinates: req.body.grave_coordinates
        ? { type: 'Point', coordinates: [req.body.grave_coordinates[0], req.body.grave_coordinates[1]] }
        : data.grave_coordinates
    });

    await data.save();
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  const deleted = await Anniversary.deleteOne({ id: req.params.id });
  res.json({
    message: deleted.deletedCount ? 'Xóa thành công' : 'Không tìm thấy dữ liệu'
  });
});

module.exports = router;
