import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BOT_CRUD_SERVICE_NAME } from 'proto/bot-crud';
import { join } from 'path';
import { GrpcClientModule } from '../grpc-client/grpc-client.module';

@Module({
  controllers: [BotController],
  providers: [BotService],
  imports:[
    CloudinaryModule,
    GrpcClientModule
  ]  
})
export class BotModule {}
