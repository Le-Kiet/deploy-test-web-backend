// uploadVideo.js (Route xử lý upload)
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../utils/cloudinaryHelper');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

router.post('/api/upload-video', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có file video' });
  }

  const inputPath = req.file.path;
  const outputPath = path.join('uploads', `compressed-${Date.now()}.mp4`);

  // Hàm xóa file an toàn
  const safeUnlink = (filePath) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) fs.unlink(filePath, () => {});
    });
  };

  // Nén video bằng ffmpeg
  ffmpeg(inputPath)
    .videoCodec('libx264')
    .size('640x?') // Resize chiều rộng 640px, giữ tỉ lệ
    .outputOptions('-crf 35') // CRF = 28 (chất lượng nhẹ, bạn có thể tăng giảm)
    .outputOptions('-preset veryfast')
    .on('end', async () => {
      try {
        // Upload video đã nén lên Cloudinary
        const result = await cloudinary.uploader.upload(outputPath, {
          resource_type: 'video',
        });

        // Xoá file tạm (gốc và nén)
        safeUnlink(inputPath);
        safeUnlink(outputPath);

        // Trả URL video đã upload
        res.json({ url: result.secure_url });
      } catch (err) {
        console.error('Lỗi upload Cloudinary:', err);
        safeUnlink(inputPath);
        safeUnlink(outputPath);
        res.status(500).json({ error: 'Upload thất bại' });
      }
    })
    .on('error', (err) => {
      console.error('Lỗi ffmpeg:', err);
      safeUnlink(inputPath);
      safeUnlink(outputPath);
      res.status(500).json({ error: 'Lỗi nén video' });
    })
    .save(outputPath);
});

module.exports = router;
