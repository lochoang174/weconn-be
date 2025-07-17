import { NestFactory, Reflector } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { JwtAuthGuard } from './auth/guards/jwt.guard';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'Image',
      protoPath: join(__dirname, '../../../proto/image.proto'),
      url: '0.0.0.0:50054',
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // Start microservices
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
