import { Module } from '@nestjs/common';
import { ImageSearchService } from './image-search.service';
import { ImageSearchController } from './image-search.controller';
import { RmqModule } from '@app/common';

@Module({
  controllers: [ImageSearchController,
  ],
  imports: [RmqModule.register({
    name: 'IMAGE',
  })],
  providers: [ImageSearchService],
})
export class ImageSearchModule { }
