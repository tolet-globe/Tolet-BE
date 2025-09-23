// config/s3UploadHelpers.js
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

// Create S3 client instance
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a file to AWS S3
 * @param {string} localFilePath - Path to the file stored locally (by multer)
 * @param {string} folder - user, property and blog....
 * @returns {{ url: string, key: string } | null}
 */
const uploadOnS3 = async (localFilePath, folder = "") => {
  try {
    if (!localFilePath) {
      console.warn("uploadOnS3: No file path provided");
      return null;
    }

    // Read the entire file as a Buffer instead of using streams
    const fileBuffer = fs.readFileSync(localFilePath);
    const fileName = path.basename(localFilePath);

    // Ensure folder has trailing slash if provided
    const prefix = folder ? folder.replace(/\/?$/, "/") : "";

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${prefix}${Date.now()}-${fileName}`,
      Body: fileBuffer, // Use Buffer instead of Stream
      ContentType: getContentType(path.extname(fileName)), // Add content type
    };

    // AWS SDK v3 syntax
    const command = new PutObjectCommand(params);
    const result = await s3.send(command);

    // Cleanup local file
    fs.unlinkSync(localFilePath);

    // Construct the URL manually for v3
    const location = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

    console.log("Upload successful:", location);

    return {
      url: location, // public URL
      key: params.Key, // S3 key (used for deletion)
    };
  } catch (error) {
    console.error("S3 upload failed:", error);

    // Cleanup local file on error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

/**
 * Helper function to get content type from file extension
 */
const getContentType = (extension) => {
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
  };
  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
};

/**
 * Deletes a file from S3 using its Key
 * @param {string} key - S3 Key of the file to delete
 * @returns {boolean} - True if deletion succeeded
 */
const deleteFromS3 = async (key) => {
  try {
    if (!key) {
      console.warn("deleteFromS3: No key provided");
      return false;
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    await s3.send(command);
    
    console.log("Deletion successful for key:", key);
    return true;
  } catch (error) {
    console.error("S3 deletion failed:", error);
    return false;
  }
};

module.exports = { uploadOnS3, deleteFromS3 };