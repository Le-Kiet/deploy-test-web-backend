const express = require('express');
const router = express.Router();
const Anniversary = require('../models/Anniversary');

// GET all
// GET all - format dữ liệu trả về
router.get('/', async (req, res) => {
  try {
    const data = await Anniversary.find();

    const formattedData = data.map(item => ({
      id: item.id,
      anni_date: item.anni_date,
      event_name: item.event_name,
      location_name: item.location_name,
      address: item.address,
      note: item.note || null,
      latitude: item.location_coordinates?.coordinates?.[1] || null,
      longtitude: item.location_coordinates?.coordinates?.[0] || null,
      grave_lat: item.grave_coordinates?.coordinates?.[1] || null,
      grave_lng: item.grave_coordinates?.coordinates?.[0] || null
    }));

    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
        ? { type: 'Point', coordinates: location_coordinates }
        : undefined,
      grave_coordinates: grave_coordinates
        ? { type: 'Point', coordinates: grave_coordinates }
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
        ? { type: 'Point', coordinates: req.body.location_coordinates }
        : data.location_coordinates,
      grave_coordinates: req.body.grave_coordinates
        ? { type: 'Point', coordinates: req.body.grave_coordinates }
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
  try {
    const deleted = await Anniversary.deleteOne({ id: req.params.id });
    res.json({
      message: deleted.deletedCount ? 'Xóa thành công' : 'Không tìm thấy dữ liệu'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
