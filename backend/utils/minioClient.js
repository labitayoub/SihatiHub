import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
// Load dotenv from backend/.env.docker if present so local tests use compose values
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const envPath = path.join(__dirname, '..', '.env.docker');
  require('dotenv').config({ path: envPath });
} catch (e) {
  // ignore if dotenv or path resolution fails
}

const Minio = require('minio');

const MINIO_HOST = process.env.MINIO_HOST || '127.0.0.1';
// Default to 9100 to match docker-compose mapping (MINIO_PORT=9100)
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9100', 10);
const MINIO_USE_SSL = (process.env.MINIO_USE_SSL === 'true') || false;
const MINIO_ACCESS_KEY = process.env.MINIO_ROOT_USER || process.env.MINIO_ACCESS_KEY || 'admin';
const MINIO_SECRET_KEY = process.env.MINIO_ROOT_PASSWORD || process.env.MINIO_SECRET_KEY || 'password';

const client = new Minio.Client({
  endPoint: MINIO_HOST,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

/**
 * Ensure a bucket exists. Returns true if created, false if already existed.
 * @param {string} bucketName
 * @returns {Promise<boolean>}
 */
export function ensureBucket(bucketName) {
  return new Promise((resolve, reject) => {
    client.bucketExists(bucketName, (err, exists) => {
      if (err) return reject(err);
      if (!exists) {
        client.makeBucket(bucketName, '', (err2) => {
          if (err2) return reject(err2);
          return resolve(true);
        });
      } else {
        return resolve(false);
      }
    });
  });
}

export default client;
