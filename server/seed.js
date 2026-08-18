require('dotenv').config();

const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function seed() {
  try {
    await sequelize.sync();

    const username = 'admin';
    const password = 'Admin123!';

    const existingUser = await User.findOne({
      where: { username }
    });

    if (existingUser) {
      console.log('Admin user already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword
    });

    console.log('Admin user created successfully.');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await sequelize.close();
  }
}

seed();