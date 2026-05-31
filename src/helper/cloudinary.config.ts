import { v2 as cloudinary } from 'cloudinary';

export function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    // jangan throw keras kalau kamu ingin app tetap jalan tanpa upload,
    // tapi untuk production sebaiknya throw.
    throw new Error('Missing Cloudinary env vars (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET)');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}