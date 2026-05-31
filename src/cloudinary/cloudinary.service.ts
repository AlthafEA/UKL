import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
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
      resource_type: 'image',
      ...options,
    };

    if (file.buffer && file.buffer.length) {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error || !result) {
              reject(error ?? new InternalServerErrorException('Cloudinary upload failed'));
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