import { Body, Controller, Post } from '@nestjs/common';
import { TestCrawlService } from './test-crawl.service';
import { Public } from '../decorator/customize';
import { CrawlListProfileDto } from './dto/crawlList.dto';

@Controller('test-crawl')
export class TestCrawlController {
  constructor(private readonly testCrawlService: TestCrawlService) {}
  @Post('crawl_list')
  @Public()
  async crawlListProfile(@Body() data: CrawlListProfileDto) {
    return this.testCrawlService.getListProfile(data);
  }

  @Post('crawl_single')
  @Public()
  async crawlsingle(@Body() data: { profileUrl: string; apiKey: string }) {
    return this.testCrawlService.crawlSingleprofile(
      data.profileUrl,
      data.apiKey,
    );
  }

  @Post('handle_all_profiles_saucurl')
  @Public()
  async handleAllProfilesWithSaucurl(@Body() data: { apiKey: string }) {
    return this.testCrawlService.handleAllProfilesWithSaucurl(data.apiKey);
  }
}
