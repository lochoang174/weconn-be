import { Body, Controller, Post } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { CrawlProfileDto } from './dto/crawlProfile.dto';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) { }
  // @Post("/")
  // async crawlListProfile(@Body() data: CrawlProfileDto) {
  //   return this.crawlService.crawlProfile(data)
  // }
  // @Post("single")
  // async crawlSingleProfile(@Body() data: CrawlProfileDto) { 

  //   return this.crawlService.crawlSingleProfile(data)
  // }
   @Post("start_bot") 
  async botProcessing(@Body() data: {id:string}) {

    return this.crawlService.bot_processing(data.id)
  }
  @Post("stop_bot")
  async stopBot(@Body() data: {id:string}) {

    return this.crawlService.stop_bot_processing(data.id)
  }
}
