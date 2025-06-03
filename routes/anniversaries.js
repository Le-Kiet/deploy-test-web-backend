const express = require('express');
const router = express.Router();
const Anniversary = require('../models/Anniversary');

function isValidCoordinates(coords) {
  return Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === 'number' &&
    typeof coords[1] === 'number';
}

// GET all
router.get('/', async (req, res) => {
  try {
    const data = await Anniversary.find();

    const formattedData = data.map(item => ({
      id: item._id, // <-- sửa lại từ item.id thành item._id
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
      id, // vẫn giữ tên id ở client để tiện, nhưng sẽ map sang _id
      anni_date, event_name,
      location_name, address,
      location_coordinates, grave_coordinates,
      note
    } = req.body;

    const newAnni = new Anniversary({
      _id: id, // <-- map vào _id ở schema
      anni_date,
      event_name,
      location_name,
      address,
      note
    });

    if (isValidCoordinates(location_coordinates)) {
      newAnni.location_coordinates = {
        type: 'Point',
        coordinates: location_coordinates
      };
    }

    if (isValidCoordinates(grave_coordinates)) {
      newAnni.grave_coordinates = {
        type: 'Point',
        coordinates: grave_coordinates
      };
    }

    await newAnni.save();
    res.status(201).json({ message: 'Thêm sự kiện thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const data = await Anniversary.findById(req.params.id); // <-- dùng findById với _id
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
    const deleted = await Anniversary.deleteOne({ _id: req.params.id }); // <-- xóa theo _id
    res.json({
      message: deleted.deletedCount ? 'Xóa thành công' : 'Không tìm thấy dữ liệu'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
