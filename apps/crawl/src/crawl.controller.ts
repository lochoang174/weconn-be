import { Controller, Get, Inject } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common'; // Giả sử RmqService được import đúng

@Controller()
export class CrawlController {
  constructor(
    private readonly crawlService: CrawlService,
    private readonly rmqService: RmqService,
  ) { }



  @EventPattern('process_crawl')
  async handleProcess(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Received process event:', data); // Log khi nhận được event
    let payload = data.payload;
    try {
      const result = await this.crawlService.getListProfile(
        payload.url,
        payload.apiKey,
      );
      this.rmqService.ack(context);
      console.log('Successfully processed and acknowledged crawl request for URL:', data.url);

    } catch (error) {
      console.error('Error processing crawl request for URL:', data.url, error);

      throw error; // Hoặc bạn có thể không ném lỗi nếu không muốn NestJS log thêm
      // mà chỉ muốn message không được ack.
    }
  }


   @EventPattern('process_crawl_single')
  async handleProcessSingle(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Received process event:', data); // Log khi nhận được event
    try {
      const result = await this.crawlService.crawlSingleprofile(
        data.url,
        data.apiKey,
      );
      this.rmqService.ack(context);
      console.log('Successfully processed and acknowledged crawl request for URL:', data.url);
    } catch (error) {
      console.error('Error processing crawl request for URL:', data.url, error);

      throw error; // Hoặc bạn có thể không ném lỗi nếu không muốn NestJS log thêm
      // mà chỉ muốn message không được ack.
    }
  } 
  @EventPattern('profile_vector_created')
  async handleProfileVectorCreated(@Payload() data: any, @Ctx() context: RmqContext) { // Thêm @Ctx() context: RmqContext
    console.log('Received profile_vector_created event:', data);
    try {
      await this.crawlService.createProfileVector(data.id);
      // Xử lý thành công, ack message
      this.rmqService.ack(context); // <-- Thêm ack ở đây
      console.log('Successfully processed and acknowledged profile_vector_created for ID:', data.id);
    } catch (error) {
      console.error('Error processing profile_vector_created for ID:', data.id, error);
      // Xử lý lỗi tương tự như trên
      throw error;
    }
  }

@EventPattern('profile_vector_created_failed')
  async handleProfileVectorCreatedFailed(@Payload() data: any, @Ctx() context: RmqContext) { // Thêm @Ctx() context: RmqContext
    console.log('Received profile_vector_created event:', data);
    try {
      await this.crawlService.removeProfile(data.id);
      this.rmqService.ack(context); // <-- Thêm ack ở đây
      console.log('Successfully processed and acknowledged profile_vector_created for ID:', data.id);
    } catch (error) {
      console.error('Error processing profile_vector_created for ID:', data.id, error);
      // Xử lý lỗi tương tự như trên
      throw error;
    }
  }

  @EventPattern('get_profile_info')
  async handleHello(@Payload() data: any, @Ctx() context: RmqContext) {
    this.crawlService.getProfileInfo(data)
    this.rmqService.ack(context);

  }
}