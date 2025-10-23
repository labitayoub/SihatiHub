import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import logger from './utils/logger.js';

dotenv.config();

const port = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      logger.info(`listening on port http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
