import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { RmqOptions } from '@nestjs/microservices';
async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.useGlobalPipes(new ValidationPipe());
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions('MAIN', false));


  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
