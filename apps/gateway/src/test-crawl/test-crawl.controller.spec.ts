import { Test, TestingModule } from '@nestjs/testing';
import { TestCrawlController } from './test-crawl.controller';
import { TestCrawlService } from './test-crawl.service';

describe('TestCrawlController', () => {
  let controller: TestCrawlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestCrawlController],
      providers: [TestCrawlService],
    }).compile();

    controller = module.get<TestCrawlController>(TestCrawlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
