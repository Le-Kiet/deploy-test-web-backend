const express = require('express');
const router = express.Router();
const Anniversary = require('../models/Anniversary');
const { deleteImageByUrl } = require('../utils/cloudinaryHelper');
const UpcomingAnniversary = require('../models/UpcomingAnniversary');
const updateUpcomingAnniversaries = require('../jobs/updateUpcomingAnniversaries');
const getNextSequence = require('../utils/getNextSequence');

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

  // ✅ BỎ id khỏi validate
  if (!anni_date || !event_name ) {
    return res.status(422).json({ message: 'Thiếu thông tin bắt buộc' });
  }

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
    // ⭐ LẤY ID AUTO
    const newId = await getNextSequence('anniversary_id');

    const newAnni = new Anniversary({
  id: newId,   // ✅ dùng id riêng

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

    // ⭐ giữ nguyên logic cũ của bạn
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

    updateUpcomingAnniversaries();

    res.status(201).json({
      message: 'Thêm sự kiện thành công',
      data: newAnni
    });

  } catch (err) {
    console.error('Lỗi khi thêm sự kiện:', err);
    res.status(500).json({ message: 'Lỗi khi thêm sự kiện' });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const data = await Anniversary.findById(req.params.id);

    if (!data)
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu' });

    const { id, _id, ...safeBody } = req.body; // ⭐ bỏ id/_id

    if (safeBody.videos) {
      data.videos = [
        ...(data.videos || []),
        ...safeBody.videos,
      ].filter((v, i, s) => s.indexOf(v) === i);
    }

    if (safeBody.images) {
      data.images = [
        ...(data.images || []),
        ...safeBody.images,
      ].filter((v, i, s) => s.indexOf(v) === i);
    }

    Object.assign(data, {
      ...safeBody,
      location_coordinates:
        safeBody.location_coordinates ?? data.location_coordinates,
      grave_coordinates:
        safeBody.grave_coordinates ?? data.grave_coordinates,
    });

    await data.save();

    updateUpcomingAnniversaries();

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
    updateUpcomingAnniversaries()

    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa:', err);
    res.status(500).json({ message: err.message });
  }
});


//lấy danh sách ngày kỵ sắp đến
router.get('/upcoming-anniversaries', async (req, res) => {
  try {
    const data = await UpcomingAnniversary.find()
      .sort({ days_remaining: 1 })
      .limit(50); // hoặc truyền limit từ client
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Không thể truy xuất danh sách' });
  }
});

module.exports = router;
module.exports = router;
