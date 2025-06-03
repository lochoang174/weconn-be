import { NestFactory } from '@nestjs/core';
import { CrawlModule } from './crawl.module';
import { ClientProxy, MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { RmqOptions } from '@nestjs/microservices';

async function bootstrap() {
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   CrawlModule,
  //   {
  //     transport: Transport.RMQ,
  //     options: {
  //       urls: ['amqp://localhost:5672'], // hoặc URL RabbitMQ bạn đang dùng
  //       queue: 'crawl_queue',
  //       queueOptions: {
  //         durable: true, 
  //       },
  //     },
  //   },
  // );
  const app = await NestFactory.create(CrawlModule);

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions('CRAWL', false));

  await app.startAllMicroservices(); 
}
bootstrap();
