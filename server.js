// server.js hoặc file server chính của bạn
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const anniversariesRouter = require('./routes/anniversaries');
const gravesRouter = require('./routes/graves');
const gravesImageRouter = require('./routes/gravesImage');
const uploadVideoRouter = require('./routes/uploadVideo');  // <-- import router upload video

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/anniversaries', anniversariesRouter);
app.use('/api/users', userRoutes);
app.use('/api/graves', gravesRouter);
app.use('/api/graveImage', gravesImageRouter);

app.use('/api/upload-video', uploadVideoRouter);  // <-- đăng ký route upload video

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
