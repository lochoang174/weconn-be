import { Body, Controller, Post } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { CrawlProfileDto } from './dto/crawlProfile.dto';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}
  @Post("/")
  async crawlListProfile(@Body() data: CrawlProfileDto) {
    return this.crawlService.crawlProfile(data)
  }

}
