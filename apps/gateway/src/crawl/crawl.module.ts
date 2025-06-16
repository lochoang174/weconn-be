import { Module } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { CrawlController } from './crawl.controller';
import { RmqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { SagaInstanceModule } from '../saga-instance/saga-instance.module';
import { SagaStepModule } from '../saga-step/saga-step.module';

@Module({
  controllers: [CrawlController],
  providers: [CrawlService],
  imports: [
    ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: join(__dirname, '../../../apps/gateway/.env'),
        }),
    RmqModule.register({
      name: 'CRAWL',
    }),
    SagaInstanceModule,
    SagaStepModule,
  ],
})
export class CrawlModule {}
