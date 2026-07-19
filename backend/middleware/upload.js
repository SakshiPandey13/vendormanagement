const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ─── Cloudinary Storage ───────────────────────────────────
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'vendorlink/misc';
    let allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

    if (file.fieldname === 'profileImage') folder = 'vendorlink/profiles';
    if (file.fieldname === 'productImage') folder = 'vendorlink/products';
    if (file.fieldname === 'documents') folder = 'vendorlink/documents';
    if (file.fieldname === 'invoice') folder = 'vendorlink/invoices';

    return {
      folder,
      allowed_formats: allowedFormats,
      resource_type: 'auto',
      transformation: file.fieldname === 'profileImage'
        ? [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
        : undefined,
    };
  },
});

// ─── Local Storage (fallback) ─────────────────────────────
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// ─── File Filter ──────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'application/pdf',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported. Allowed: JPEG, PNG, WEBP, PDF'), false);
  }
};

// ─── Multer instances ─────────────────────────────────────
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

const storage = useCloudinary ? cloudinaryStorage : localStorage;

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter,
});

module.exports = upload;
