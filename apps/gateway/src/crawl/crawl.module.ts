import { Module } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { CrawlController } from './crawl.controller';
import { RmqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BOT_SERVICE_NAME } from 'proto/bot';

@Module({
  controllers: [CrawlController],
  providers: [CrawlService],
  imports: [
    // ConfigModule.forRoot({
    //       isGlobal: true,
    //       envFilePath: join(__dirname, '../../../apps/gateway/.env'),
    //     }),
    // RmqModule.register({
    //   name: 'CRAWL',
    // }),

    ClientsModule.register([
      {
        name: BOT_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: 'bot',
          protoPath: join(__dirname, '../../../proto/bot.proto'), // Đường dẫn đúng
          url: 'localhost:50051', // Quan trọng: Listen trên tất cả interfaces
        },
      },
    ]),
  ],
})
export class CrawlModule {}
