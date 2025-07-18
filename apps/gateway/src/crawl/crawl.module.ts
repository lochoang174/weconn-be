import { Module } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { CrawlController } from './crawl.controller';
import { RmqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BOT_SERVICE_NAME } from 'proto/bot';
import { SocketModule } from '../socket/socket.module';
import { GrpcClientModule } from '../grpc-client/grpc-client.module';

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
    GrpcClientModule,
    SocketModule,
     
  ], 
})
export class CrawlModule {}
