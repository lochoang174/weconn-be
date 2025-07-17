import { Body, Controller, Post } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { CrawlProfileDto } from './dto/crawlProfile.dto';
import { CrawlListProfileDto } from '../test-crawl/dto/crawlList.dto';
import { Public } from '../decorator/customize';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Post('start_bot')
  @Public()
  async botProcessing(@Body() data: { id: string }) {
    return this.crawlService.bot_processing(data.id);
  }
  @Post('stop_bot')
  @Public()
  async stopBot(@Body() data: { id: string }) {
    return this.crawlService.stop_bot_processing(data.id);
  }
  @Post('start_crawl_detail')
  @Public()
  async botProcessingCrawlDetail(@Body() data: { id: string }) {
    return this.crawlService.start_bot_detail_processing(data.id);
  }
}
