import { Module } from '@nestjs/common';
import { GrpcClientService } from './grpc-client.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BOT_CRUD_SERVICE_NAME } from 'proto/bot-crud';
import { join } from 'path';
import { PAYMENT_PACKAGE_NAME } from 'proto/payment';

@Module({
  controllers: [],
  providers: [GrpcClientService],
  imports: [
    ClientsModule.register([
      {
        name: BOT_CRUD_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: "bot_crud",
          protoPath: join(__dirname, "../../../proto/bot-crud.proto"), // Đường dẫn đúng
          url: "localhost:50052", // Quan trọng: Listen trên tất cả interfaces
        },
      },
    ]),
     ClientsModule.register([
      {
        name: PAYMENT_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: "payment",
          protoPath: join(__dirname, "../../../proto/payment.proto"), // Đường dẫn đúng
          url: "localhost:50053", 
        },
      },
    ]),
  ],
    exports: [ClientsModule], // <-- EXPORT để module khác dùng

})
export class GrpcClientModule { }
