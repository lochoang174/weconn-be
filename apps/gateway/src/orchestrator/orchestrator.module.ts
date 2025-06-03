import { Module } from '@nestjs/common';
import { CrawlConsumer } from './crawl.consumer';
import { ImageSearchConsumer } from './image-search.consumer';
import { RmqModule } from '@app/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { SocketModule } from '../socket/socket.module';


@Module({
  controllers: [CrawlConsumer,ImageSearchConsumer,

  ],
  imports: [
    RmqModule.register({
      name: 'CRAWL',
    }),
    RmqModule.register({
      name: 'IMAGE',
    }),
    CloudinaryModule,
    SocketModule
  ],
})
export class OrchestratorModule {}
