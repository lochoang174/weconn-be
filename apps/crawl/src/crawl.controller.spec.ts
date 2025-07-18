import { Test, TestingModule } from '@nestjs/testing';
import { CrawlController } from './crawl.controller';
import { CrawlService } from './crawl.service';

describe('CrawlController', () => {
  let crawlController: CrawlController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CrawlController],
      providers: [CrawlService],
    }).compile();

    crawlController = app.get<CrawlController>(CrawlController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(crawlController.getHello()).toBe('Hello World!');
    });
  });
});
