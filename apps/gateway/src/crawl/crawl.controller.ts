import { Body, Controller, Post } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { CrawlProfileDto } from './dto/crawlProfile.dto';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) { }

   @Post("start_bot") 
  async botProcessing(@Body() data: {id:string}) {

    return this.crawlService.bot_processing(data.id)
  }
  @Post("stop_bot")
  async stopBot(@Body() data: {id:string}) {

    return this.crawlService.stop_bot_processing(data.id)
  }
   @Post("start_crawl_detail") 
  async botProcessingCrawlDetail(@Body() data: {id:string}) {

    return this.crawlService.start_bot_detail_processing(data.id)
  }
  @Post("stop_crawl_detail")
  async stopBotCrawlDetail(@Body() data: {id:string}) {
 
    return this.crawlService.stop_bot_detail_processing(data.id)
  }
}
