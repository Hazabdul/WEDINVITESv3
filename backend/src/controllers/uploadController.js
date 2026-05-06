import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const uploadsDir = path.resolve(__dirname, '../uploads');
const maxFileSize = Number.parseInt(process.env.MAX_FILE_SIZE || '', 10) || 10 * 1024 * 1024;
const maxVideoFileSize = Number.parseInt(process.env.VIDEO_MAX_FILE_SIZE || '', 10) || 100 * 1024 * 1024;
const maxUploadFileSize = Math.max(maxFileSize, maxVideoFileSize);
const imageQuality = Math.min(
  85,
  Math.max(70, Number.parseInt(process.env.IMAGE_QUALITY || '', 10) || 82)
);
const imageOutputFormat = /^avif$/i.test(process.env.IMAGE_OUTPUT_FORMAT || '') ? 'avif' : 'webp';
const optimizedImageExtension = imageOutputFormat === 'avif' ? '.avif' : '.webp';
const optimizedImageMimeType = imageOutputFormat === 'avif' ? 'image/avif' : 'image/webp';
const largeImageContexts = new Set(['banner', 'background', 'cover', 'coverimage', 'hero', 'heroimage', 'main']);
const videoTargets = {
  p720: { maxShortEdge: 720, bitrateKbps: 1800 },
  p1080: { maxShortEdge: 1080, bitrateKbps: 3500 },
};

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

const normalizeUploadContext = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

const getImageMaxWidth = (context = '') => (
  largeImageContexts.has(normalizeUploadContext(context)) ? 1920 : 1200
);

const getPublicBaseUrl = (req) => {
  const configuredCdn = (process.env.MEDIA_CDN_BASE_URL || '').trim().replace(/\/+$/, '');
  if (configuredCdn) return configuredCdn;

  const forwardedProto = req.get('x-forwarded-proto');
  const requestedProtocol = forwardedProto ? forwardedProto.split(',')[0].trim() : req.protocol;
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : requestedProtocol;
  return `${protocol}://${req.get('host')}`;
};

const optimizeUploadedImage = async (file, context) => {
  if (!file?.mimetype?.startsWith('image/')) {
    return {
      file,
      metadata: null,
      optimized: false,
    };
  }

  const originalSize = file.size;
  const parsed = path.parse(file.filename);
  const optimizedFilename = `${parsed.name}-optimized${optimizedImageExtension}`;
  const optimizedPath = path.join(file.destination, optimizedFilename);
  const maxWidth = getImageMaxWidth(context);

  const pipeline = sharp(file.path, { failOn: 'none' })
    .rotate()
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
    });

  const info = imageOutputFormat === 'avif'
    ? await pipeline.avif({ quality: imageQuality, effort: 5 }).toFile(optimizedPath)
    : await pipeline.webp({ quality: imageQuality, effort: 5 }).toFile(optimizedPath);

  await fs.promises.unlink(file.path).catch(() => {});

  return {
    file: {
      ...file,
      filename: optimizedFilename,
      path: optimizedPath,
      mimetype: optimizedImageMimeType,
      size: info.size,
    },
    metadata: {
      width: info.width,
      height: info.height,
      originalSize,
      maxWidth,
      quality: imageQuality,
      format: imageOutputFormat,
    },
    optimized: true,
  };
};

const runBinary = (binaryPath, args) => new Promise((resolve, reject) => {
  const child = spawn(binaryPath, args, {
    windowsHide: true,
  });
  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  child.on('error', reject);
  child.on('close', (code) => {
    if (code === 0) {
      resolve({ stdout, stderr });
      return;
    }

    reject(new Error(stderr || `Process exited with code ${code}`));
  });
});

const probeVideo = async (filePath) => {
  const { stdout } = await runBinary(ffprobeStatic.path, [
    '-v',
    'error',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    filePath,
  ]);
  const payload = JSON.parse(stdout);
  const videoStream = payload.streams?.find((stream) => stream.codec_type === 'video');
  if (!videoStream?.width || !videoStream?.height) {
    throw new Error('No video stream found.');
  }

  return {
    codec: videoStream.codec_name || '',
    width: Number(videoStream.width),
    height: Number(videoStream.height),
    duration: Number(videoStream.duration || payload.format?.duration || 0),
  };
};

const roundEven = (value) => Math.max(2, Math.round(value / 2) * 2);

const getVideoPlan = ({ width, height }) => {
  const isPortrait = height > width;
  const maxWidth = isPortrait ? 1080 : 1920;
  const maxHeight = isPortrait ? 1920 : 1080;
  const scaleRatio = Math.min(1, maxWidth / width, maxHeight / height);
  const targetWidth = roundEven(width * scaleRatio);
  const targetHeight = roundEven(height * scaleRatio);
  const shortEdge = Math.min(targetWidth, targetHeight);
  const target = shortEdge <= videoTargets.p720.maxShortEdge ? videoTargets.p720 : videoTargets.p1080;

  return {
    targetWidth,
    targetHeight,
    bitrateKbps: target.bitrateKbps,
    maxAverageBitrateMbps: target.bitrateKbps / 800,
    needsResize: targetWidth !== width || targetHeight !== height,
  };
};

const createVideoPoster = async (videoPath, destination, baseName, metadata) => {
  const posterFilename = `${baseName}-poster.webp`;
  const posterPath = path.join(destination, posterFilename);
  const ratio = Math.min(1, 640 / metadata.width);
  const posterWidth = roundEven(metadata.width * ratio);
  const posterHeight = roundEven(metadata.height * ratio);

  try {
    await runBinary(ffmpegPath, [
      '-y',
      '-ss',
      '0.2',
      '-i',
      videoPath,
      '-frames:v',
      '1',
      '-vf',
      `scale=${posterWidth}:${posterHeight}`,
      '-vcodec',
      'libwebp',
      '-quality',
      '78',
      posterPath,
    ]);
    const posterStats = await fs.promises.stat(posterPath);
    return {
      filename: posterFilename,
      width: posterWidth,
      height: posterHeight,
      size: posterStats.size,
      format: 'webp',
    };
  } catch {
    await fs.promises.unlink(posterPath).catch(() => {});
    return null;
  }
};

const withPoster = async (videoPath, destination, baseName, metadata) => ({
  ...metadata,
  poster: await createVideoPoster(videoPath, destination, baseName, metadata),
});

const isCompliantVideo = (file, metadata, plan) => {
  const isAcceptedCodec = file.mimetype === 'video/webm' ||
    (file.mimetype === 'video/mp4' && metadata.codec === 'h264');
  const averageBitrateMbps = metadata.duration > 0
    ? (file.size * 8) / metadata.duration / 1_000_000
    : Number.POSITIVE_INFINITY;

  return isAcceptedCodec &&
    !plan.needsResize &&
    averageBitrateMbps <= plan.maxAverageBitrateMbps;
};

const optimizeUploadedVideo = async (file) => {
  if (!file?.mimetype?.startsWith('video/')) {
    return {
      file,
      metadata: null,
      optimized: false,
    };
  }

  const originalSize = file.size;
  const inputMetadata = await probeVideo(file.path);
  const plan = getVideoPlan(inputMetadata);

  if (isCompliantVideo(file, inputMetadata, plan)) {
    const parsed = path.parse(file.filename);
    const metadata = await withPoster(file.path, file.destination, parsed.name, {
      ...inputMetadata,
      originalSize,
      bitrateKbps: Math.round((originalSize * 8) / Math.max(inputMetadata.duration || 1, 1) / 1000),
      format: file.mimetype === 'video/webm' ? 'webm' : 'mp4',
    });

    return {
      file,
      metadata,
      optimized: false,
    };
  }

  const parsed = path.parse(file.filename);
  const optimizedFilename = `${parsed.name}-optimized.mp4`;
  const optimizedPath = path.join(file.destination, optimizedFilename);
  const ffmpegArgs = [
    '-y',
    '-i',
    file.path,
    '-map',
    '0:v:0',
    '-map',
    '0:a?',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '23',
    '-maxrate',
    `${plan.bitrateKbps}k`,
    '-bufsize',
    `${plan.bitrateKbps * 2}k`,
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-ac',
    '2',
  ];

  if (plan.needsResize) {
    ffmpegArgs.push('-vf', `scale=${plan.targetWidth}:${plan.targetHeight}`);
  }

  ffmpegArgs.push(optimizedPath);

  await runBinary(ffmpegPath, ffmpegArgs);
  const outputStats = await fs.promises.stat(optimizedPath);
  const outputMetadata = await probeVideo(optimizedPath);
  const outputMetadataWithPoster = await withPoster(optimizedPath, file.destination, path.parse(optimizedFilename).name, {
    ...outputMetadata,
    originalSize,
    bitrateKbps: plan.bitrateKbps,
    maxWidth: plan.targetWidth,
    maxHeight: plan.targetHeight,
    format: 'mp4',
  });
  await fs.promises.unlink(file.path).catch(() => {});

  return {
    file: {
      ...file,
      filename: optimizedFilename,
      path: optimizedPath,
      mimetype: 'video/mp4',
      size: outputStats.size,
    },
    metadata: outputMetadataWithPoster,
    optimized: true,
  };
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
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Images, MP4/WebM videos and MP3 audio are allowed.');
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

export const handleUpload = async (req, res) => {
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

  let uploadedFile = req.file;
  let mediaMetadata = null;
  let optimized = false;
  const isImageUpload = req.file.mimetype.startsWith('image/');
  const isVideoUpload = req.file.mimetype.startsWith('video/');

  try {
    const optimizedResult = isImageUpload
      ? await optimizeUploadedImage(req.file, req.body?.context)
      : await optimizeUploadedVideo(req.file);
    uploadedFile = optimizedResult.file;
    mediaMetadata = optimizedResult.metadata;
    optimized = optimizedResult.optimized;
  } catch (error) {
    fs.unlink(req.file.path, () => {});
    return res.status(422).json({
      success: false,
      message: isVideoUpload
        ? 'Video optimization failed. Please upload a valid MP4 or WebM video.'
        : 'Image optimization failed. Please upload a valid image file.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }

  const publicBaseUrl = getPublicBaseUrl(req);
  const fileUrl = `${publicBaseUrl}/uploads/${uploadedFile.filename}`;
  const posterUrl = isVideoUpload && mediaMetadata?.poster?.filename
    ? `${publicBaseUrl}/uploads/${mediaMetadata.poster.filename}`
    : '';
  res.status(201).json({
    success: true,
    url: fileUrl,
    ...(posterUrl ? { posterUrl } : {}),
    filename: uploadedFile.filename,
    mimetype: uploadedFile.mimetype,
    size: uploadedFile.size,
    optimized,
    ...(isImageUpload && mediaMetadata ? { image: mediaMetadata } : {}),
    ...(isVideoUpload && mediaMetadata ? { video: mediaMetadata } : {}),
  });
};
