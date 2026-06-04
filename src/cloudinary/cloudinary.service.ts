import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { type UploadApiOptions, type UploadApiResponse } from 'cloudinary';
import { Readable } from 'node:stream';
import { configureCloudinary } from '../helper/cloudinary.config';

@Injectable()
export class CloudinaryService {
  private readonly cloudinary = configureCloudinary();

  async uploadImage(
    file: Express.Multer.File,
    options: UploadApiOptions = {},
  ): Promise<UploadApiResponse> {
    if (!file) throw new BadRequestException('File is required');

    const uploadOptions: UploadApiOptions = {
      resource_type: 'auto',
      ...options,
    };

    if (file.buffer && file.buffer.length) {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error || !result) {
              console.log('Cloudinary error (direct):', error);
              console.log(
                'Cloudinary error keys:',
                error ? Object.keys(error) : null,
              );

              // Kadang detail ada di response/headers
              const anyErr = error as any;
              console.log('Cloudinary error extra:', {
                name: anyErr?.name,
                message: anyErr?.message,
                http_code: anyErr?.http_code,
                statusCode: anyErr?.statusCode,
                error: anyErr?.error,
                response: anyErr?.response,
                headers: anyErr?.response?.headers,
                xCldError:
                  anyErr?.response?.headers?.['x-cld-error'] ??
                  anyErr?.response?.headers?.['X-Cld-Error'],
              });

              reject(error);
              return;
            }

            resolve(result);
          },
        );

        Readable.from(file.buffer).pipe(uploadStream);
      });
    }

    // diskStorage case
    const anyFile = file as Express.Multer.File & { path?: string };
    if (anyFile.path) {
      return this.cloudinary.uploader.upload(anyFile.path, uploadOptions);
    }

    throw new BadRequestException('Uploaded file is missing buffer or path');
  }
}
