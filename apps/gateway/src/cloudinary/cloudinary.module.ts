import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { ConfigModule } from '@nestjs/config';
import { RmqModule } from '@app/common';

@Module({
 imports: [ConfigModule,
   RmqModule.register({
        name: 'IMAGE',
      }),
 ],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
