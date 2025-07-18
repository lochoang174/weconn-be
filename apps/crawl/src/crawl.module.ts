import { Module } from '@nestjs/common';
import { CrawlController } from './crawl.controller';
import { CrawlService } from './crawl.service';
import { DatabaseModule, RmqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { CrawlRepository } from './crawl.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Bot, BotSchema } from './schemas/bot.schema';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '../../../apps/crawl/.env'),
    }),
    DatabaseModule.forRoot({
      crawl: 'CRAWL_URI',
    }),
    MongooseModule.forFeature(
      [{ name: Bot.name, schema: BotSchema }],
      'crawl_bot',
    ),
    // RmqModule.register({
    //   name: 'MAIN',
    // }),
  ],
  controllers: [CrawlController],
  providers: [CrawlService, CrawlRepository],
})
export class CrawlModule {}
