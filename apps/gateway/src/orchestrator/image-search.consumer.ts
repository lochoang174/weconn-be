import { Controller, Inject, Logger } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  ClientProxy,

} from '@nestjs/microservices';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RmqService } from '@app/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SocketService } from '../socket/socket.service';

@Controller()
export class ImageSearchConsumer {
  private readonly logger = new Logger(ImageSearchConsumer.name);

  constructor(
    @Inject('CRAWL') private client: ClientProxy,
    private readonly rmqService: RmqService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly socketService: SocketService,
    private readonly cloudinaryService: CloudinaryService) { }

  @EventPattern('vector_created')
  async handleVectorCreated(@Payload() data: any) {
    console.log('Received vector_created event:', data);
    this.client.emit("profile_vector_created", { "id": data.id_profile })

  }
  @EventPattern('search_face_result')
  async handlerSearchResult(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Received search_face_result event:', data);
    this.client.emit("get_profile_info", data)


  }
  @EventPattern('face_detector_response')
  async handleCropImage(@Payload() data: any, @Ctx() context: RmqContext): Promise<void> {
    this.logger.log(`Received 'face_detector_response': ${JSON.stringify(data)}`);

    if (!data || !data.id || !data.url || !data.faces) {
      this.logger.error(
        'Invalid data for face_detector_response. Missing id, url, or faces.',
        data,
      );
      this.rmqService.ack(context); // Acknowledge to remove from queue
      return;
    }

    const result = this.cloudinaryService.getCroppedFaceUrls(data.url, data.faces);
    const userId = data.id.toString();
    const ttlInSeconds = 360000;
    const emittedViaSocket = await this.socketService.attemptEmitToUser(
      userId,
      'guest_response',
      result,
    );
    console.log(emittedViaSocket)

    if (emittedViaSocket) {
      this.logger.log(
        `Response for userId '${userId}' emitted successfully via WebSocket.`,
      );

    } else {

      const guestResponseKey = `GUEST_RESPONSE_${userId}`;
      await this.cacheManager.set(guestResponseKey, result, ttlInSeconds);
      // const pendingResponse = await this.cacheManager.get<any>(guestResponseKey);
      // console.log(await this.cacheManager.stores)
      // this.logger.log(`Giá trị 'result' sẽ được lưu cho userId '${userId}': ${JSON.stringify(result)}`); // <--- THÊM LOG NÀY

    }

    this.rmqService.ack(context);
  }
}
