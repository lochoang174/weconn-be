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

@Module({
  imports: [
    CrawlModule,
    // OrchestratorModule,
    UploadModule,
    CloudinaryModule,
    SocketModule,
    CacheModule.register({
        isGlobal: true,
        ttl:3600
    }),
    ImageSearchModule,
    DatabaseModule.forRoot({
          saga: 'SAGA_URI',
        }),
    SagaStepModule,
    SagaInstanceModule,
 
  
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
