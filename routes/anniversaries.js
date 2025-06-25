const express = require('express');
const router = express.Router();
const Anniversary = require('../models/Anniversary');
const { deleteImageByUrl } = require('../utils/cloudinaryHelper');
function isValidCoordinates(coords) {
  return Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === 'number' &&
    typeof coords[1] === 'number';
}
const { uploadImage } = require('../utils/cloudinaryHelper'); // cần thêm hàm này
// GET all
router.get('/', async (req, res) => {
  try {
    // ✅ THÊM .lean() để trả về plain JS object
    const data = await Anniversary.find().lean();

    const formattedData = data.map(item => ({
      id: item._id,
      anni_date: item.anni_date,
      event_name: item.event_name,
      location_name: item.location_name,
      address: item.address,
      note: item.note || null,
      latitude: item.location_coordinates?.coordinates?.[1] || null,
      longtitude: item.location_coordinates?.coordinates?.[0] || null,
      grave_lat: item.grave_coordinates?.coordinates?.[1] || null,
      grave_lng: item.grave_coordinates?.coordinates?.[0] || null,
      images: item.images || null, // ✅ GIỮ ĐÚNG, giờ sẽ nhận được nhờ .lean()
      videos: item.videos || null
    }));

    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// POST new

router.post('/', async (req, res) => {
  const {
    id,
    anni_date,
    event_name,
    location_name,
    address,
    note,
    location_coordinates,
    grave_coordinates,
    images,
    videos
  } = req.body;

  // Kiểm tra dữ liệu bắt buộc
  if (!id || !anni_date || !event_name || !location_name || !address) {
    return res.status(422).json({ message: 'Thiếu thông tin bắt buộc' });
  }

  // Kiểm tra tọa độ nếu có
  const isValidPoint = (geom) =>
    geom &&
    geom.type === 'Point' &&
    Array.isArray(geom.coordinates) &&
    geom.coordinates.length === 2 &&
    geom.coordinates.every((n) => typeof n === 'number');

  if (
    (location_coordinates && !isValidPoint(location_coordinates)) ||
    (grave_coordinates && !isValidPoint(grave_coordinates))
  ) {
    return res.status(422).json({ message: 'Tọa độ không hợp lệ' });
  }

  try {
    const newAnni = new Anniversary({
      _id: id,
      anni_date,
      event_name,
      location_name,
      address,
      note,
      location_coordinates,
      grave_coordinates,
      images,
      videos
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
    console.log('Saved anniversary:', newAnni);
    res.status(201).json({ message: 'Thêm sự kiện thành công', data: newAnni });
  } catch (err) {
    console.error('Lỗi khi thêm sự kiện:', err);
    res.status(500).json({ message: 'Lỗi khi thêm sự kiện' });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const data = await Anniversary.findById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Không tìm thấy dữ liệu' });

    // Xử lý videos
    if (req.body.videos && Array.isArray(req.body.videos)) {
      const oldVideos = data.videos || [];
      const newVideos = req.body.videos;
      data.videos = [...oldVideos, ...newVideos].filter(
        (value, index, self) => self.indexOf(value) === index
      );
    }

    // Xử lý images
    if (req.body.images && Array.isArray(req.body.images)) {
      const oldImages = data.images || [];
      const newImages = req.body.images;
      data.images = [...oldImages, ...newImages].filter(
        (value, index, self) => self.indexOf(value) === index
      );
    }

    Object.assign(data, {
      ...req.body,
      location_coordinates: req.body.location_coordinates ?? data.location_coordinates,
      grave_coordinates: req.body.grave_coordinates ?? data.grave_coordinates,
    });

    await data.save();
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error('Lỗi cập nhật:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const data = await Anniversary.findById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Không tìm thấy dữ liệu' });

    // Xóa ảnh nếu có
    if (data.image_url) {
      await deleteImageByUrl(data.image_url);
    }

    await Anniversary.deleteOne({ _id: req.params.id });
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa:', err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
