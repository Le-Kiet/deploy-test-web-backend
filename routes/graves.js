const express = require('express');
const router = express.Router();
const Grave = require('../models/Grave');
const getNextSequence = require('../utils/getNextSequence');

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
  const { grave, generation, location, note, geom, images, videos } = req.body;

  if (
    !grave || !generation 
    // ||
    // !location ||
    // !geom ||
    // geom.type !== 'Point' ||
    // !Array.isArray(geom.coordinates) ||
    // geom.coordinates.length !== 2
  ) {
    return res.status(422).json({ message: 'Dữ liệu không hợp lệ' });
  }

  try {
    // ⭐ auto increment id
    const newId = await getNextSequence('grave_id');

    const newGrave = new Grave({
      id: newId,   // ⭐ giống Anniversary

      grave,
      generation,
      location,
      note,
      geom,
      images,
      videos
    });

    await newGrave.save();

    console.log('Saved grave:', newGrave);

    res.status(201).json({
      message: 'Thêm thành công',
      data: newGrave
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi thêm mộ phần' });
  }
});


// PUT update grave
router.put('/:id', async (req, res) => {
  try {
    const graveDoc = await Grave.findById(req.params.id);

    if (!graveDoc)
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu' });

    const {
      id,      // ⭐ bỏ
      _id,     // ⭐ bỏ
      images,
      ...safeBody
    } = req.body;

    // ⭐ validate geom nếu có
    if (safeBody.geom) {
      const g = safeBody.geom;
      if (
        g.type !== 'Point' ||
        !Array.isArray(g.coordinates) ||
        g.coordinates.length !== 2
      ) {
        return res.status(422).json({ message: 'Tọa độ không hợp lệ' });
      }
    }

    // ⭐ update fields
    Object.assign(graveDoc, safeBody);

    // ⭐ chỉ update images khi gửi lên
    if (images) {
      graveDoc.images = [
        ...(graveDoc.images || []),
        ...images
      ].filter((v, i, s) => s.indexOf(v) === i);
    }

    await graveDoc.save();

    res.json({
      message: 'Cập nhật thành công',
      data: graveDoc
    });

  } catch (err) {
    console.error(err);
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
