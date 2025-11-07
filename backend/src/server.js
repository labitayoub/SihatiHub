import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import { initializeMinIOBuckets } from './services/minioService.js';
import Document from './models/Document.js';

// Only load .env file if environment variables are not already set (not in Docker)
if (!process.env.MONGO_URI) {
  dotenv.config();
}

const port = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB();
    await initializeMinIOBuckets();
    
    const server = app.listen(port, () => {
      logger.info(`listening on port http://localhost:${port}`);
    });

    server.on('error', (error) => {
      logger.error('Server error:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
