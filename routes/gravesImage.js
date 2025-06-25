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
    geom.coordinates.length !== 2 ||
    geom.coordinates.some(c => typeof c !== 'number' || isNaN(c))
  ) {
    return res.status(422).json({ message: 'Dữ liệu không hợp lệ' });
  }

  try {
    const existing = await Grave.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu' });
    }

    let updatedImages = existing.images || [];
    if (Array.isArray(images)) {
      updatedImages = [...updatedImages, ...images].filter(
        (value, index, self) => self.indexOf(value) === index
      );
    }

    let updatedVideos = existing.videos || [];
    if (Array.isArray(videos)) {
      updatedVideos = [...updatedVideos, ...videos].filter(
        (value, index, self) => self.indexOf(value) === index
      );
    }

    existing.grave = grave;
    existing.generation = generation;
    existing.location = location;
    existing.note = note;
    existing.geom = geom;
    existing.images = updatedImages;
    existing.videos = updatedVideos;

    await existing.save({ validateBeforeSave: true });

    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error('Lỗi khi cập nhật:', err.message, err.stack);
    res.status(500).json({ message: err.message });
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
