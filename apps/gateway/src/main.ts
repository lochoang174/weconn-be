import { NestFactory, Reflector } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { RmqOptions } from '@nestjs/microservices';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
async function bootstrap() {
  const app = await NestFactory.create(GatewayModule, {
    cors: {
      origin: 'http://localhost:3001',
      credentials: true,
    },
  });  app.useGlobalPipes(new ValidationPipe());
  // const rmqService = app.get<RmqService>(RmqService);
  // app.connectMicroservice<RmqOptions>(rmqService.getOptions('MAIN', false));
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
