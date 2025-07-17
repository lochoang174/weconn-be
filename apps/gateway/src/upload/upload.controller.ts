import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,

  BadRequestException,

} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService, CloudinaryUploadResult } from '../cloudinary/cloudinary.service';
import { UploadService } from './upload.service';
import { Public } from '../decorator/customize';
import { GrpcMethod } from '@nestjs/microservices';
import { ImageRequest, ImageResponse } from 'proto/image';

export class UploadSingleDto {
  folder?: string;
  transformation?: any;
}

export class UploadFromUrlDto {
  imageUrl: string;
  folder?: string;
  transformation?: any;
}

export class DeleteImageDto {
  publicId: string;
}

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly cloudinaryService: CloudinaryService) { }

  @Post('image-search')
  @Public()
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    try {
      const result = await this.uploadService.uploadAndCropImage(
        file,
        "guest",

      );

      return result
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }


  @Post('cookie-json')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCookieJson(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: boolean; data: CloudinaryUploadResult }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    try {
      const result = await this.cloudinaryService.uploadJsonFile(
        file,
        "cookie",

      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }




  @GrpcMethod('ImageService', 'UploadToCloud')
  async uploadImage(data: ImageRequest) {
    // handle logic
    let res = await this.uploadService.uploadDataImage(data.imageUrl, "data")
    return { imageUrl: res }
  }
}