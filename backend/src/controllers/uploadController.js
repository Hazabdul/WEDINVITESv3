import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const uploadsDir = path.resolve(__dirname, '../uploads');
const maxFileSize = Number.parseInt(process.env.MAX_FILE_SIZE || '', 10) || 10 * 1024 * 1024;
const maxVideoFileSize = Number.parseInt(process.env.VIDEO_MAX_FILE_SIZE || '', 10) || 100 * 1024 * 1024;
const maxUploadFileSize = Math.max(maxFileSize, maxVideoFileSize);

const formatFileSize = (bytes) => {
  if (bytes >= 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
};

const getFileLimit = (mimetype = '') => (
  mimetype.startsWith('video/') ? maxVideoFileSize : maxFileSize
);

const getFileKind = (mimetype = '') => {
  if (mimetype.startsWith('video/')) return 'Video';
  if (mimetype.startsWith('audio/')) return 'Audio';
  return 'File';
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/quicktime', 'video/webm', 'video/ogg',
    'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/x-m4a', 'audio/mp4'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Supported formats: JPEG, PNG, WEBP, GIF, SVG, MP4, MOV, WEBM videos and MP3, WAV, M4A audios.');
    error.status = 415;
    cb(error, false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: maxUploadFileSize },
  fileFilter
});

export const uploadSingle = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? `File is too large. Maximum video size is ${formatFileSize(maxVideoFileSize)}.`
        : error.message;

      return res.status(status).json({
        success: false,
        message,
        code: error.code,
      });
    }

    return res.status(error.status || 400).json({
      success: false,
      message: error.message || 'File upload failed.',
    });
  });
};

export const handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const fileLimit = getFileLimit(req.file.mimetype);

  if (req.file.size > fileLimit) {
    fs.unlink(req.file.path, () => {});
    return res.status(413).json({
      success: false,
      message: `${getFileKind(req.file.mimetype)} is too large. Maximum size is ${formatFileSize(fileLimit)}.`,
      maxFileSize: fileLimit,
    });
  }

  const forwardedProto = req.get('x-forwarded-proto');
  const requestedProtocol = forwardedProto ? forwardedProto.split(',')[0].trim() : req.protocol;
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : requestedProtocol;
  const fileUrl = `${protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(201).json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
};
