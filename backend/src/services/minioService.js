import minioClient, { ensureBucket } from '../../utils/minioClient.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const BUCKET_DOCUMENTS = process.env.MINIO_BUCKET_DOCUMENTS || 'sihati-documents';
const BUCKET_LAB_REPORTS = process.env.MINIO_BUCKET_LAB_REPORTS || 'sihati-lab-reports';
const BUCKET_ORDONNANCES = process.env.MINIO_BUCKET_ORDONNANCES || 'sihati-ordonnances';

/**
 * Initialize MinIO buckets
 */
export const initializeMinIOBuckets = async () => {
  try {
    await ensureBucket(BUCKET_DOCUMENTS);
    await ensureBucket(BUCKET_LAB_REPORTS);
    await ensureBucket(BUCKET_ORDONNANCES);
    console.log('✅ MinIO buckets initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing MinIO buckets:', error);
    throw error;
  }
};

/**
 * Upload file to MinIO
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} originalName - Original filename
 * @param {string} mimetype - File mimetype
 * @param {string} bucketName - Target bucket
 * @returns {Promise<{fileName: string, fileUrl: string, bucketName: string}>}
 */
export const uploadFileToMinio = async (fileBuffer, originalName, mimetype, bucketName = BUCKET_DOCUMENTS) => {
  try {
    // Ensure bucket exists
    await ensureBucket(bucketName);

    // Generate unique filename
    const fileExtension = path.extname(originalName);
    const fileName = `${Date.now()}_${uuidv4()}${fileExtension}`;

    // Upload to MinIO
    await minioClient.putObject(
      bucketName,
      fileName,
      fileBuffer,
      fileBuffer.length,
      {
        'Content-Type': mimetype,
        'x-amz-meta-original-name': originalName
      }
    );

    // Generate file URL
    const fileUrl = await getFileUrl(bucketName, fileName);

    return {
      fileName,
      fileUrl,
      bucketName
    };
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Get presigned URL for file download
 * @param {string} bucketName - Bucket name
 * @param {string} fileName - File name
 * @param {number} expiry - URL expiry in seconds (default: 3600)
 * @returns {Promise<string>}
 */
export const getFileUrl = async (bucketName, fileName, expiry = 3600) => {
  try {
    const url = await minioClient.presignedGetObject(bucketName, fileName, expiry);
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error(`Failed to generate file URL: ${error.message}`);
  }
};

/**
 * Delete file from MinIO
 * @param {string} bucketName - Bucket name
 * @param {string} fileName - File name
 * @returns {Promise<void>}
 */
export const deleteFileFromMinio = async (bucketName, fileName) => {
  try {
    await minioClient.removeObject(bucketName, fileName);
    console.log(`✅ File deleted: ${fileName} from bucket: ${bucketName}`);
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

/**
 * Download file from MinIO
 * @param {string} bucketName - Bucket name
 * @param {string} fileName - File name
 * @returns {Promise<Buffer>}
 */
export const downloadFileFromMinio = async (bucketName, fileName) => {
  try {
    const dataStream = await minioClient.getObject(bucketName, fileName);
    const chunks = [];
    
    return new Promise((resolve, reject) => {
      dataStream.on('data', (chunk) => chunks.push(chunk));
      dataStream.on('end', () => resolve(Buffer.concat(chunks)));
      dataStream.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading file from MinIO:', error);
    throw new Error(`Failed to download file: ${error.message}`);
  }
};

export {
  BUCKET_DOCUMENTS,
  BUCKET_LAB_REPORTS,
  BUCKET_ORDONNANCES
};
