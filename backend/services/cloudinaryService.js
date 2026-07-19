const cloudinary = require('../config/cloudinary');

/**
 * Upload a file buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, folder = 'vendorlink/misc', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by public_id
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return null;
  }
};

/**
 * Extract public_id from Cloudinary URL
 */
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const folder = parts[parts.length - 2];
  const publicId = `${folder}/${filename.split('.')[0]}`;
  return publicId;
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl };
