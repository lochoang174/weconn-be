import { Module } from '@nestjs/common';
import { TestCrawlService } from './test-crawl.service';
import { TestCrawlController } from './test-crawl.controller';
import { GrpcClientModule } from '../grpc-client/grpc-client.module';

@Module({
  controllers: [TestCrawlController],
  providers: [TestCrawlService],
  imports:[GrpcClientModule]
})
export class TestCrawlModule {}
