const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:8080',
  })
);

app.use(express.json());

const uploadDir =
  process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');

app.use('/uploads', express.static(uploadDir));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({
    message: err.message || 'Something went wrong.',
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.sync();

    // Create default admin account if it does not already exist
    const username = 'admin';
    const password = 'Admin123!';

    const existingUser = await User.findOne({
      where: { username }
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        username,
        password: hashedPassword
      });

      console.log('Default admin user created.');
    } else {
      console.log('Admin user already exists.');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();