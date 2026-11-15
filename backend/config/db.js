const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

