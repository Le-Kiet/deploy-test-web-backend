// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const anniversariesRouter = require('./routes/anniversaries');
const gravesRouter = require('./routes/graves');
const gravesImageRouter = require('./routes/gravesImage');
const uploadVideoRouter = require('./routes/uploadVideo');
const authRoutes = require('./routes/auth');  // Đường dẫn đến file auth.js bạn tạo
const cron = require('node-cron');
const updateUpcomingAnniversaries = require('./jobs/updateUpcomingAnniversaries');
const shouldRunToday = require('./jobs/shouldRunToday');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Các route hiện tại
app.use('/api/anniversaries', anniversariesRouter);
app.use('/api/users', userRoutes);
app.use('/api/graves', gravesRouter);
app.use('/api/graveImage', gravesImageRouter);
app.use('/api/upload-video', uploadVideoRouter);

// Route cho auth Firebase
app.use('/api/auth', authRoutes);

// Route để lấy danh sách ngày kỵ sắp đến
updateUpcomingAnniversaries();
(async () => {
  if (await shouldRunToday()) {
    console.log('Cập nhật ngày kỵ khi khởi động server...');
    await updateUpcomingAnniversaries();
  } else {
    console.log('✅ Ngày kỵ đã được cập nhật hôm nay. Không cần chạy lại.');
  }
})();

// Kết nối MongoDB
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
