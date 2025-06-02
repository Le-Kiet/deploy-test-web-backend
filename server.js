// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();


// const app = express();
// app.use(cors());
// app.use(express.json());

// const PORT = process.env.PORT || 5000;
// const userRoutes = require('./routes/userRoutes');
// app.use('/api/users', userRoutes);
// // Connect MongoDB
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log("MongoDB connected"))
//   .catch(err => console.log(err));

// // Example route
// app.get("/", (req, res) => {
//   res.send("Hello from backend!");
// });

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const anniversariesRouter = require('./routes/anniversaries');
const gravesRouter = require('./routes/graves');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/anniversaries', anniversariesRouter);
app.use('/api/users', userRoutes);
app.use('/api/graves', gravesRouter);
mongoose.connect('/api/anniversaries')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
