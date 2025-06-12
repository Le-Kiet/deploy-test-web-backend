const express = require('express');
const router = express.Router();
const Grave = require('../models/Grave');

// GET all graves
router.get('/', async (req, res) => {
  try {
    const graves = await Grave.find().lean();
    const formatted = graves.map(g => ({
      ...g,
      latitude: g.geom?.coordinates[1],
      longtitude: g.geom?.coordinates[0],
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi truy vấn' });
  }
});

// POST new grave
// POST new grave (thêm videos)
router.post('/', async (req, res) => {
  const { grave, generation, location, note, geom, images, videos } = req.body;

  if (!grave || !location || !geom || geom.type !== 'Point' || !Array.isArray(geom.coordinates) || geom.coordinates.length !== 2) {
    return res.status(422).json({ message: 'Dữ liệu không hợp lệ' });
  }
    if (req.file) {
      const uploadResult = await uploadVideoWithEagerSync(req.file.path);
      // uploadResult.secure_url là URL gốc
      // uploadResult.eager[0].secure_url là URL bản nén
      videos.push(uploadResult.secure_url);
      // hoặc dùng uploadResult.eager[0].secure_url nếu muốn link bản nén
    }
  try {
    const newGrave = new Grave({
      grave,
      generation,
      location,
      note,
      geom,
      images,  // mảng URL hoặc chuỗi
      videos,  // thêm videos
    });
    console.log(req.body);
    await newGrave.save();
    console.log('Saved grave:', newGrave);
    res.status(201).json({ message: 'Thêm thành công', data: newGrave });
  } catch (err) {
  console.error('Lỗi server khi save:', err);
  res.status(500).json({ message: 'Lỗi khi thêm mộ phần' });
}
});

// PUT update grave (thêm videos)
router.put('/:id', async (req, res) => {
  const { grave, generation, location, note, geom, images, videos } = req.body;

  if (
    typeof grave !== 'string' ||
    typeof location !== 'string' ||
    !geom ||
    geom.type !== 'Point' ||
    !Array.isArray(geom.coordinates) ||
    geom.coordinates.length !== 2
  ) {
    return res.status(422).json({ message: 'Dữ liệu không hợp lệ' });
  }

  try {
    const updated = await Grave.findByIdAndUpdate(req.params.id, {
      grave,
      generation,
      location,
      note,
      geom,
      ...(images && { images }),
      ...(videos && { videos }),  // thêm xử lý videos nếu có
    });

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu' });
    }

    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật' });
  }
});



// DELETE grave
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Grave.findByIdAndDelete(req.params.id);
    res.json({
      message: deleted ? 'Đã xóa thành công' : 'Không tìm thấy dữ liệu'
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa' });
  }
});

module.exports = router;
