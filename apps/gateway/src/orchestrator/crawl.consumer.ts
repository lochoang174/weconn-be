import { Controller, Inject, Logger } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SocketService } from '../socket/socket.service';

@Controller()
export class CrawlConsumer {
  private readonly logger = new Logger(CrawlConsumer.name);

  constructor(@Inject('IMAGE') private client: ClientProxy,
    private readonly rmqService: RmqService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly socketService: SocketService,
  ) { }

  @EventPattern('profile_created')
  async handleProfileCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Received profile_created event:', data);
    let payload = { profilePicture: data.profilePicture, id: data.id };
    console.log(payload);
    this.client.emit('face_indexing', payload);
    this.rmqService.ack(context);



  }
  @EventPattern('profile_info')
  async handleResponseProfile(@Payload() data: any, @Ctx() context: RmqContext) {

    console.log(data.id)
    if (!data) {
      this.logger.error(
        'Invalid data for face_detector_response. Missing id, url, or faces.',
        data,
      );
      this.rmqService.ack(context);
    }
    const userId = data.id.toString();
    const ttlInSeconds = 360000;
    const emittedViaSocket = await this.socketService.attemptEmitToUser(
      userId,
      'search_response',
      data.result,
    );
    if (emittedViaSocket) {
      this.logger.log(
        `Response for userId '${userId}' emitted successfully via WebSocket.`,
      );

    } else {

      const guestResponseKey = `SEARCH_RESPONSE_${userId}`;
      await this.cacheManager.set(guestResponseKey, data.result, ttlInSeconds);
      // const pendingResponse = await this.cacheManager.get<any>(guestResponseKey);
      // console.log(await this.cacheManager.stores)
      // this.logger.log(`Giá trị 'result' sẽ được lưu cho userId '${userId}': ${JSON.stringify(result)}`); // <--- THÊM LOG NÀY

    }
    this.rmqService.ack(context);

  }

}
