import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,

  BadRequestException,

} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService, CloudinaryUploadResult } from '../cloudinary/cloudinary.service';

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
  constructor(private readonly cloudinaryService: CloudinaryService) { }

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: boolean; data: CloudinaryUploadResult }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    try {
      const result = await this.cloudinaryService.uploadImage(
        file,
        "guest",

      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }




}