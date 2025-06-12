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
router.post('/', async (req, res) => {
  const { grave, generation, location, note, geom, images } = req.body;



  if (!grave || !location || !geom || geom.type !== 'Point' || !Array.isArray(geom.coordinates) || geom.coordinates.length !== 2) {
    return res.status(422).json({ message: 'Dữ liệu không hợp lệ' });
  }

  try {

  const newGrave = new Grave({
    grave,
    generation,
    location,
    note,
    geom,
    images
  });
  console.log(req.body);
    await newGrave.save();
    console.log('Saved grave:', newGrave);
    res.status(201).json({ message: 'Thêm thành công', data: newGrave });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi thêm mộ phần' });
  }
});

// PUT update grave
router.put('/:id', async (req, res) => {
  const { grave, generation, location, note, geom, images } = req.body;

  // Kiểm tra dữ liệu hợp lệ
  if (
    typeof grave !== 'string' ||
    typeof location !== 'string' ||
    !geom ||
    geom.type !== 'Point' ||
    !Array.isArray(geom.coordinates) ||
    geom.coordinates.length !== 2 ||
    (images && !Array.isArray(images))
  ) {
    return res.status(422).json({ message: 'Dữ liệu không hợp lệ' });
  }

  try {
    const updated = await Grave.findByIdAndUpdate(
      req.params.id,
      {
        grave,
        generation,
        location,
        note,
        geom,
        images: images || [] // nếu không gửi images thì để mặc định là []
      },
      { new: true } // trả về bản ghi đã cập nhật
    );

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu' });
    }

    res.json({ message: 'Cập nhật thành công', data: updated });
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
