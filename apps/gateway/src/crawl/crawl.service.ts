import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { CrawlProfileDto } from './dto/crawlProfile.dto';
@Injectable()
export class CrawlService {
  constructor(@Inject('CRAWL') private client: ClientProxy) {}

  async crawlProfile(data: CrawlProfileDto) {

    return this.client.emit('process_crawl', data); // "" nghĩa là default exchange
  }
}
