const s3 = require("../config/aws.js");
const fs = require("fs");
const path = require("path");

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

    const fileStream = fs.createReadStream(localFilePath);
    const fileName = path.basename(localFilePath);

    // Ensure folder has trailing slash if provided
    const prefix = folder ? folder.replace(/\/?$/, "/") : "";

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${prefix}${Date.now()}-${fileName}`,
      Body: fileStream,
    };

    const result = await s3.upload(params).promise();

    // Cleanup local file
    fs.unlinkSync(localFilePath);

    console.log("Upload successful:", result.Location);

    return {
      url: result.Location, // public URL
      key: result.Key,      // S3 key (used for deletion)
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

    const result = await s3.deleteObject(params).promise();
    console.log("Deletion successful:", result);
    return true;
  } catch (error) {
    console.error("S3 deletion failed:", error);
    return false;
  }
};

module.exports = { uploadOnS3, deleteFromS3 };
