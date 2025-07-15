import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { CrawlModule } from './crawl/crawl.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UploadModule } from './upload/upload.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { SocketModule } from './socket/socket.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ImageSearchModule } from './image-search/image-search.module';
import { DatabaseModule } from '@app/common';
import { SagaStepModule } from './saga-step/saga-step.module';
import { SagaInstanceModule } from './saga-instance/saga-instance.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { BotModule } from './bot/bot.module';
import { BOT_CRUD_SERVICE_NAME } from 'proto/bot-crud';
import { GrpcClientModule } from './grpc-client/grpc-client.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TestCrawlModule } from './test-crawl/test-crawl.module';
import { GuestModule } from './guest/guest.module';
import { PaymentModule } from './payment/payment.module';
import { SubcriptionModule } from 'apps/payment/src/subcription/subcription.module';

@Module({
  imports: [
    CrawlModule,
    // OrchestratorModule,
    BotModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '../../../apps/gateway/.env'),
    }),

    UploadModule,
    CloudinaryModule,
    SocketModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 3600,
    }),

    ImageSearchModule,
    GrpcClientModule,
    DatabaseModule.forRoot({
      user: 'USER_URI',
    }),
    UserModule,
    AuthModule,
    TestCrawlModule,
    GuestModule,
    PaymentModule,
    SubcriptionModule,
    // SagaStepModule,
    // SagaInstanceModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
