const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

const fileRoutes = require('./src/routes/fileRoutes');
app.use('/api/files', fileRoutes);

// Jobs routes
const jobRoutes = require('./src/routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running');
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const blockchainRoutes = require("./src/routes/blockchainRoutes");
app.use("/blockchain", blockchainRoutes);