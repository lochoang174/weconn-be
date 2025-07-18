import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { PaymentModule } from './payment.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(PaymentModule, {
    transport: Transport.GRPC,
    options: {
      package: 'payment',
      protoPath: join(__dirname, '../../../proto/payment.proto'),
      url: '0.0.0.0:50053',  // Port phải là 50053 để khớp client
    },
  });

  await app.listen();
  console.log('Payment microservice is listening on port 50053');
}

bootstrap();
