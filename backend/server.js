const dotenv = require('dotenv');

// Load environment variables before importing app and db
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Pharmacy Management Server Running`);
      console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(` Port        : ${PORT}`);
      console.log(` API Base    : http://localhost:${PORT}/api`);
      console.log(`===============================================`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection Error: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error(`Uncaught Exception: ${err.message}`);
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('Received kill signal, shutting down gracefully...');
      server.close(() => {
        console.log('Closed remaining connections.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

