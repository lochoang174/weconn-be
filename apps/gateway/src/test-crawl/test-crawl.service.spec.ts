import { Test, TestingModule } from '@nestjs/testing';
import { TestCrawlService } from './test-crawl.service';

describe('TestCrawlService', () => {
  let service: TestCrawlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestCrawlService],
    }).compile();

    service = module.get<TestCrawlService>(TestCrawlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
