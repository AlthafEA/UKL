import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from 'cloudinary';
import { Readable } from 'node:stream';
import { CreateCloudinaryDto } from './dto/create-cloudinary.dto';
import { UpdateCloudinaryDto } from './dto/update-cloudinary.dto';

type UploadedFile = {
  buffer?: Buffer;
  path?: string;
};

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  create(createCloudinaryDto: CreateCloudinaryDto) {
    return 'This action adds a new cloudinary';
  }

  findAll() {
    return `This action returns all cloudinary`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cloudinary`;
  }

  update(id: number, updateCloudinaryDto: UpdateCloudinaryDto) {
    return `This action updates a #${id} cloudinary`;
  }

  remove(id: number) {
    return `This action removes a #${id} cloudinary`;
  }

  async uploadImage(
    file: UploadedFile,
    options: UploadApiOptions = {},
  ): Promise<UploadApiResponse> {
    if (!file) throw new BadRequestException('File is required');

    const uploadOptions: UploadApiOptions = {
      resource_type: 'image',
      ...options,
    };

    const buffer = file.buffer;

    if (buffer && buffer.length) {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error || !result) {
              reject(error ?? new InternalServerErrorException('Cloudinary upload failed'));
              return;
            }

            resolve(result);
          },
        );

        Readable.from(buffer).pipe(uploadStream);
      });
    }

    const diskFile = file as UploadedFile & { path?: string };
    if (diskFile.path) {
      return cloudinary.uploader.upload(diskFile.path, uploadOptions);
    }

    throw new BadRequestException('Uploaded file is missing buffer or path');
  }
}
