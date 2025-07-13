import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { GrpcClientModule } from '../grpc-client/grpc-client.module';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  imports:[CloudinaryModule,GrpcClientModule]
})
export class UploadModule {}
