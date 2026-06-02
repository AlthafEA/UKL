import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

export function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Missing Cloudinary env vars (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET)',
    );
  }

  // Configure once (prevent re-config in hot reload / multiple modules)
  if (!isConfigured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    console.log('cloudinary configured', {
      cloudName,
      apiKeyTail: apiKey.slice(-6),
      apiSecretLen: apiSecret.length,
    });

    isConfigured = true;
  }

  return cloudinary;
}