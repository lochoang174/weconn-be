import { Module } from '@nestjs/common';
import { GrpcClientService } from './grpc-client.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BOT_CRUD_SERVICE_NAME } from 'proto/bot-crud';
import { join } from 'path';
import { PAYMENT_PACKAGE_NAME } from 'proto/payment';
import * as protoPath from 'google-proto-files'; // ✅ to get correct path
import * as path from 'path';

const googleProtoDir = path.dirname(
  protoPath.getProtoPath('google/protobuf/empty.proto'),
);
import { BOT_SERVICE_NAME } from 'proto/bot';

@Module({
  controllers: [],
  providers: [GrpcClientService],
  imports: [
    ClientsModule.register([
      {
        name: BOT_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: 'bot',
          protoPath: join(__dirname, '../../../proto/bot.proto'), // Đường dẫn đúng
          url: 'host.docker.internal:50051', // Quan trọng: Listen trên tất cả interfaces
        },
      },
    ]),
    ClientsModule.register([
      {
        name: BOT_CRUD_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: 'bot_crud',
          protoPath: join(__dirname, '../../../proto/bot-crud.proto'), // Đường dẫn đúng
          url: 'face-search:50052', // Quan trọng: Listen trên tất cả interfaces
        },
      },
    ]),
    ClientsModule.register([
      {
        name: PAYMENT_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: 'payment',
          protoPath: join(__dirname, '../../../proto/payment.proto'), // Đường dẫn đúng
          url: 'localhost:50053',
          loader: {
            includeDirs: [
              join(__dirname, '../../../proto'),
              googleProtoDir, // ✅ Proper path to google protos
            ],
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule], // <-- EXPORT để module khác dùng
})
export class GrpcClientModule {}
