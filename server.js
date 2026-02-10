// ⭐ PHẢI Ở DÒNG ĐẦU TIÊN
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');

const userRoutes = require('./routes/userRoutes');
const anniversariesRouter = require('./routes/anniversaries');
const gravesRouter = require('./routes/graves');
const gravesImageRouter = require('./routes/gravesImage');
const uploadVideoRouter = require('./routes/uploadVideo');
const authRoutes = require('./routes/auth');

const updateUpcomingAnniversaries = require('./jobs/updateUpcomingAnniversaries');
const shouldRunToday = require('./jobs/shouldRunToday');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log('MONGO_URI =', process.env.MONGO_URI);

// routes
app.use('/api/anniversaries', anniversariesRouter);
app.use('/api/users', userRoutes);
app.use('/api/graves', gravesRouter);
app.use('/api/graveImage', gravesImageRouter);
app.use('/api/upload-video', uploadVideoRouter);
app.use('/api/auth', authRoutes);


// ⭐ CONNECT TRƯỚC
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // ⭐ CHỈ CHẠY SAU KHI CONNECT
    if (await shouldRunToday()) {
      console.log('Cập nhật ngày kỵ khi khởi động server...');
      updateUpcomingAnniversaries()
  .catch(err => console.error('Update upcoming failed:', err));

    }

    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch(err => console.error(err));
