const cloudinary = require('cloudinary').v2;

require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getPublicIdFromUrl(url) {
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  } catch (err) {
    return null;
  }
}

async function deleteImageByUrl(url) {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Đã xóa ảnh: ${publicId}`);
  } catch (err) {
    console.error('Lỗi khi xóa ảnh:', err);
  }
}

async function uploadImage(base64Data) {
  try {
    return await cloudinary.uploader.upload(base64Data, {
      folder: 'anniversaries', // Tên folder trên Cloudinary
    });
  } catch (err) {
    console.error('Lỗi upload ảnh:', err);
    return null;
  }
}

async function uploadVideoWithEagerSync(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      eager: [
        {
          width: 640,
          height: 360,
          crop: 'limit',
          quality: 'auto:low',
          format: 'webm',
          bitrate: '500k',
        },
      ],
      eager_async: false,   // chuyển sang đồng bộ
    });

    console.log('Upload video thành công:', result);
    console.log('URL video gốc:', result.secure_url);

    if (result.eager && result.eager.length > 0) {
      console.log('Link video nén:', result.eager[0].secure_url);
      return result.eager[0].secure_url;
    } else {
      return result.secure_url;
    }
  } catch (error) {
    console.error('Upload video lỗi:', error);
    throw error;
  }
}

module.exports = {
  getPublicIdFromUrl,
  deleteImageByUrl,
  uploadImage, // ✅ export thêm
  uploadVideoWithEagerSync
};
