import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  imports:[CloudinaryModule]
})
export class UploadModule {}
