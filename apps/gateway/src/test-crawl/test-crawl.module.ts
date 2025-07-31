import { Module } from '@nestjs/common';
import { TestCrawlService } from './test-crawl.service';
import { TestCrawlController } from './test-crawl.controller';
import { GrpcClientModule } from '../grpc-client/grpc-client.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Url, UrlSchema } from './crawl.schema';
import { CrawlRepository } from './crawl.repository';

@Module({
  controllers: [TestCrawlController],
  providers: [TestCrawlService,CrawlRepository],
  imports:[GrpcClientModule,
    MongooseModule.forFeature(
      [{ name: Url.name, schema: UrlSchema }],
      'crawl',
    ),
  ]
})
export class TestCrawlModule {}
